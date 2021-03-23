import convertTokenIdToAddress from './convertTokenIdToAddress.js';

export default function getCrucibleIdsFromEvents(events, withEvent) {
	const handledIds = new Set();
	const crucibleIds = [];
	for (const event of events) {
		if (!event.args.tokenId) {
			console.error(`Missing tokenId arg`, event);
			continue;
		}
		const id = convertTokenIdToAddress(event.args.tokenId);
		if (!handledIds.has(id)) {
			handledIds.add(id);
			crucibleIds.push(withEvent ? {id, event} : id);
		}
	}
	return crucibleIds;
};
