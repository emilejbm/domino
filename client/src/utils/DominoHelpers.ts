type NumZeroToSix = 0 | 1 | 2 | 3 | 4 | 5 | 6
type Domino = [NumZeroToSix, NumZeroToSix]

function ShuffleDominos(dominoList: Domino[]): Domino[] {
    for (let i = dominoList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dominoList[i], dominoList[j]] = [dominoList[j], dominoList[i]];
    }
    return dominoList;
}

function GenerateDominoList(): Domino[] {
    const dominoList: Domino[] = [];
    for(let i = 0 as NumZeroToSix; i <= 6; i++) {
        for(let j = i; j <= 6; j++) {
            dominoList.push([i,j])
        }
    }
    const shuffledDominoList = ShuffleDominos(dominoList)
    return shuffledDominoList
}

export default GenerateDominoList;