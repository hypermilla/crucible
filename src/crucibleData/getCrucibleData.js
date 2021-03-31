import {ethers} from 'ethers';
import contracts from './contracts/contracts.js';
import getContract from './getContract.js';
import throttler from './throttler.js';

// Stuff that's commented out can be enabled if desired but the lockedBalance is likely what you actually want to use
// Keeping the unused stuff commented out reduces network load

const provider = new ethers.providers.Web3Provider(window.ethereum);
const crucibleFactory = getContract(contracts.CrucibleFactory, provider);
// const lpToken = getContract(contracts.LPToken, provider);

function isError(obj) {
	return Object.prototype.toString.call(obj) === "[object Error]";
}

async function getTimestamp(id) {
	// Filter for Transfer event when Crucible was created, third parameter being the tokenId to target just the one event
	const filter = crucibleFactory.filters.Transfer(contracts.Transmuter.address, null, id);
	const crucibleEvents = await throttler.queue(() => {
		return crucibleFactory.queryFilter(filter, 0, "latest");
	});
	if (crucibleEvents.length > 1) {
		throw new Error(`Got more than one minting event:\n${JSON.stringify(crucibleEvents)}`);
	}
	if (crucibleEvents.length < 1) {
		throw new Error(`Couldn't find minting event for ${id}`);
	}
	const block = await throttler.queue(() => {
		return crucibleEvents[0].getBlock();
	}, 'block');
	return block.timestamp * 1000;
}

export default async function getCrucibleData(id) {
	// For faster loading, the async calls are launched at the same time, and the later awaited as required for subsequent stages
	// Unfortunately this means if the promises are rejected, they are considered unhandled by the JS runtime, because there can be a delay before they are awaited
	// To work around this we catch them, and resolve to the error, and then later check if their resolved value is an error and re-throw it
	// It ain't pretty but it works
	const crucible = getContract({address: id, abi: contracts.Crucible.abi}, provider);
	const ownerPromise = throttler.queue(() => {
		return crucibleFactory.ownerOf(id);
	}).catch(err => err);
	// const balancePromise = throttler.queue(() => {
	// 	return lpToken.balanceOf(crucible.address);
	// }).catch(err => err);
	const lockedBalancePromise = throttler.queue(() => {
		return crucible.getBalanceLocked(contracts.LPToken.address);
	}).catch(err => err);
	const timestampPromise = getTimestamp(id).catch(err => err);
	// delegatedBalance is dependent on owner, so await it first
	const owner = await ownerPromise;
	if (isError(owner)) {
		throw owner;
	}
	// const delegatedBalancePromise = throttler.queue(() => {
	// 	return crucible.getBalanceDelegated(contracts.LPToken.address, owner);
	// }, 'delegatedBalance').catch(err => err);
	const resolveValues = await Promise.all([
		// balancePromise,
		lockedBalancePromise,
		// delegatedBalancePromise,
		timestampPromise
	]);
	for (const resolveValue of resolveValues) {
		if (isError(resolveValue)) {
			throw resolveValue;
		}
	}
	const [
		// balance,
		lockedBalance,
		// delegatedBalance,
		timestamp
	] = resolveValues;
	return {
		id,
		owner,
		// balance,
		lockedBalance,
		// delegatedBalance,
		timestamp
	};
}
