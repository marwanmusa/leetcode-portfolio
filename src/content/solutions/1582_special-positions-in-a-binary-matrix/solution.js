/**
 * @param {number[][]} mat
 * @return {number}
 */
var numSpecial = function(mat) {
    const r = mat.length,
          c = mat[0].length,
          rSum = new Array(r).fill(0),
          cSum = new Array(c).fill(0);

    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            if (mat[i][j] === 1) {
                rSum[i]++;
                cSum[j]++;
            }
        }
    }
    let ans = 0;
    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            if (mat[i][j] === 1 && rSum[i] === 1 && cSum[j] === 1) {
                ans++;
            }
        }
    }
    return ans;
};