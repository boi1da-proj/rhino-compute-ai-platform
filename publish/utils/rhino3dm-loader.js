let rhinoPromise = null;
module.exports = function loadRhino3dm() {
if (!rhinoPromise) {
const rhino3dm = require('rhino3dm');
rhinoPromise = rhino3dm();
}
return rhinoPromise;
};
