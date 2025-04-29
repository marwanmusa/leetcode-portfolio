#include <vector>
using namespace std;

class Solution {
    public:
        int numSpecial(vector<vector<int>>& mat) {
            int r = mat.size(), c = mat[0].size();
            vector<int> rSum(r, 0), cSum(c, 0);

            for (int i = 0; i < r; i++) {
                for (int j = 0; j < c; j++) {
                    if (mat[i][j] == 1) {
                        rSum[i]++;
                        cSum[j]++;
                    }
                }
            }
            int ans = 0;
            for (int i = 0; i < r; i++) {
                for (int j = 0; j < c; j++) {
                    if (mat[i][j] == 1 && rSum[i] == 1 && cSum[j] == 1) {
                        ans++;
                    }
                }
            }
            return ans;
        }
};