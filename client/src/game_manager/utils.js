const SpawnerType = {
	MONSTER: 'MONSTER',
	CHEST: 'CHEST',
};
function randomNumber(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
const scaleFactor = 2;

export { SpawnerType, randomNumber, scaleFactor };
