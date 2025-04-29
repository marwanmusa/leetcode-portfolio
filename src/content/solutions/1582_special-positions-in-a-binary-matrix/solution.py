class Solution:
    def numSpecial(self, mat: list[list[int]]) -> int:
        r, c = len(mat), len(mat[0])
        rsum, csum = [0]*r, [0]*c

        for i in range(r):
            for j in range(c):
                if mat[i][j] == 1:
                    rsum[i] += 1
                    csum[j] += 1
        
        ans = 0
        for i in range(r):
            for j in range(c):
                if mat[i][j] == 1 and rsum[i] == 1 and csum[j] == 1:
                    ans += 1

        return ans