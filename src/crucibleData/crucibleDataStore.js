import getAllCrucibleIds from './getAllCrucibleIds.js';
import getCrucibleData from './getCrucibleData.js';
import getCrucibleDataForAccount from './getCrucibleDataForAccount.js';

class CrucibleDataStore {
	constructor() {
		this._unloadedCrucibleIds = [];
		this._pendingLoadPromises = new Map();
		this._loadedCrucibles = new Map();
		this._erroredCrucibles = new Map();
		this._callbacks = new Set();
		this._initPromise = this._init().catch(console.error);
	}

	get unloadedCount() {
		return this._unloadedCrucibleIds.length;
	}

	get pendingCount() {
		return this._pendingLoadPromises.size;
	}

	get loadedCount() {
		return this._loadedCrucibles.size;
	}

	get erroredCount() {
		return this._erroredCrucibles.size;
	}

	get crucibleCount() {
		return this.unloadedCount + this.pendingCount + this.loadedCount;
	}

	addCrucibleLoadedCallback(callback) {
		this._callbacks.add(callback);
	}

	removeCrucibleLoadedCallback(callback) {
		this._callbacks.delete(callback);
	}

	async load(count = 1) {
		await this._initPromise;
		while (count > 0) {
			count--;
			if (this.unloadedCount === 0) {
				return;
			}
			this.getCrucibleData(this._unloadedCrucibleIds.shift());
		}
	}

	async getCrucibleData(idOrObject) {
		const id = idOrObject.id || idOrObject;
		const event = idOrObject.event || null;
		const data = this._loadedCrucibles.get(id);
		if (data) {
			return data;
		}
		let loadPromise = this._pendingLoadPromises.get(id);
		if (loadPromise) {
			return loadPromise;
		}
		loadPromise = getCrucibleData(id)
			.then((data) => {
				this._pendingLoadPromises.delete(id);
				this._loadedCrucibles.set(id, data);
				for (const callback of this._callbacks) {
					callback(data);
				}
				return data;
			})
			.catch((err) => {
				this._pendingLoadPromises.delete(id);
				this._erroredCrucibles.set(id, {id, event, err});
				return null;
			});
		this._pendingLoadPromises.set(id, loadPromise);
		return loadPromise;
	}

	getAllLoadedCrucibleData() {
		return Array.from(this._loadedCrucibles.values()).sort((a, b) => a.timestamp - b.timestamp);
	}

	getCrucibleDataForAccount(address) {
		return getCrucibleDataForAccount(address, this.getCrucibleData.bind(this));
	}

	getErroredCrucibles() {
		return this._erroredCrucibles;
	}

	async _init() {
		const ids = await getAllCrucibleIds(true);
		for (const id of ids) {
			this._unloadedCrucibleIds.push(id);
		}
		// TODO set up listener for newly created Crucibles
	}
}

export default new CrucibleDataStore();
