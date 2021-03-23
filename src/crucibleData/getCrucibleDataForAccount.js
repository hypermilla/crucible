import {ethers} from 'ethers';
import contracts from './contracts/contracts.js';
import getContract from './getContract.js';
import getCrucibleData from './getCrucibleData.js';
import getCrucibleIdsFromEvents from './getCrucibleIdsFromEvents.js';
import throttler from './throttler.js';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const crucibleFactory = getContract(contracts.CrucibleFactory, provider);

export default async function getCrucibleDataForAccount(address, getCrucibleDataFunc = getCrucibleData) {
	// As far as I know, the only way to send a Crucible to another account involves call the "safeTransferFrom" method on the CrucibleFactory
	// This means that no matter how many times a Crucible has been passed from account to account, we can always find a Transfer event of this by querying the CrucibleFactory
	// Thus, filter Transfers by target address set to the account we're interested in
	const filter = crucibleFactory.filters.Transfer(null, address);
	const crucibleEvents = await throttler.queue(() => {
		return crucibleFactory.queryFilter(filter, 0, "latest");
	}, 'events');

	const crucibleIds = getCrucibleIdsFromEvents(crucibleEvents);
	const crucibles = await Promise.all(crucibleIds.map(getCrucibleDataFunc));

	// There is the possibility that a Crucible has been transferred to an account which has transferred it on again to another
	// The initial filter doesn't distinguish this, so we filter again to remove Crucibles who report an owner different to the desired account address
	return crucibles.filter((crucible) => {
		return crucible.owner === address;
	});
}
