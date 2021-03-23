import XorShift from './xorshift.js';

export default class PRNG {
	constructor(seedData) {
		// seedData is expected to the Crucible tokenId in hex form
		// This is 160bits of data, so we need to break it into five 32bit integers of which four will be used to seed a PRNG instance
		// Ideally some clever chap can find a PRNG that takes 160bit seed but I am not that chap
		// We'll make do by seeding multiple PRNG instances with different subsets of the five seeds, it kinda works...
		let trimmedSeedData = seedData;
		if (seedData.startsWith('0x')) {
			trimmedSeedData = seedData.slice(2);
		}
		this._seeds = [];
		while (this._seeds.length < 5) {
			if (trimmedSeedData.length > 0) {
				// In hex format 32 bits are 8 characters
				const seedHexString = trimmedSeedData.slice(-8);
				trimmedSeedData = trimmedSeedData.slice(0, -8);
				this._seeds.push(parseInt(seedHexString, 16));
			} else {
				// Rare tokenId with lots of leading zeroes I guess
				this._seeds.push(0);
			}
		}
		// We'll increment this for each PRNG instance we make, and use it to pick the starting seed
		this._startSeedIndex = 0;
		this._prngs = {};
	}

	randomInt(channelName, outcomeCount = Number.MAX_SAFE_INTEGER) {
		if (!this._prngs[channelName]) {
			this._createPRNG(channelName);
		}
		// Probably needs to use .randomint but I can't be bothered to figure out doing it correctly right now
		const rn = this._prngs[channelName].random();
		return Math.floor(rn * outcomeCount);
	}

	randomFloat(channelName) {
		return this._prngs[channelName].random();
	}

	_createPRNG(channelName) {
		const seeds = [];
		for (let i = 0; i < 4; i++) {
			const seedIndex = (this._startSeedIndex + i) % this._seeds.length;
			seeds.push(this._seeds[seedIndex]);
		}
		this._startSeedIndex = (this._startSeedIndex + 1) % this._seeds.length;
		this._prngs[channelName] = new XorShift(seeds);
	}
}