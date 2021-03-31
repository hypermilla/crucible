import {ethers} from 'ethers';

export default function getContract({address, abi}, provider) {
	return new ethers.Contract(address, abi, provider);
}
