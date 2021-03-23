export default function convertTokenIdToAddress(tokenId) {
	let id = tokenId.toHexString();
	if (id.length < 42) {
		id = '0x' + id.slice(2).padStart(40, '0');
	}
	return id;
}
