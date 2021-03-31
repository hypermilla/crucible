class Throttler {
	constructor(options = {}) {
		this._maxConcurrentPromises = options.maxConcurrentPromises || 20;
		this._retryAttempts = options.retryAttempts || 5;
		this._queue = [];
		this._activePromises = 0;
		this._shiftTimeoutId = null;
	}

	queue(promiseGenerator) {
		return new Promise((resolve, reject) => {
			this._queue.push({
				promiseGenerator,
				resolve,
				reject
			});
			this._tryToShiftQueue();
		});
	}

	_tryToShiftQueue() {
		if (this._shiftTimeoutId) {
			return;
		}
		this._shiftTimeoutId = setTimeout(() => {
			this._shiftTimeoutId = null;
			while (this._activePromises < this._maxConcurrentPromises && this._queue.length) {
				this._activePromises++;
				this._tryToExecute(this._queue.shift());
			}
			if (this._queue.length) {
				this._tryToShiftQueue();
			}
		}, 1);
	}

	async _tryToExecute(item, remainingAttempts = this._retryAttempts) {
		try {
			const ret = await item.promiseGenerator();
			this._activePromises--;
			item.resolve(ret);
			this._tryToShiftQueue();
		} catch (err) {
			if (remainingAttempts > 0) {
				this._tryToExecute(item, --remainingAttempts);
			} else {
				this._activePromises--;
				item.reject(err);
				this._tryToShiftQueue();
			}
		}
	}
}

class MultiChannelThrottler {
	constructor() {
		this._channelDefault = new Throttler({maxConcurrentPromises: 20, retryAttempts: 1});
		this._channels = {};
	}

	queue(promiseGenerator, channel) {
		let throttler = this._channelDefault;
		if (channel) {
			if (!this._channels[channel]) {
				this._channels[channel] = new Throttler({maxConcurrentPromises: 2, retryAttempts: 1});
			}
			throttler = this._channels[channel];
		}
		return throttler.queue(promiseGenerator);
	}
}

export default new MultiChannelThrottler();
