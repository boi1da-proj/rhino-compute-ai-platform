module.exports = {
url: process.env.SOFT_COMPUTE_URL || 'http://127.0.0.1:8081',
apiKey: process.env.SOFT_COMPUTE_API_KEY || '',
isLocalTestMode: () => process.env.SOFT_ENV !== 'production',
isServiceAvailable: () => true, // we actually probe in getServiceStatus
async getServiceStatus() {
try {
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);
const res = await fetch((process.env.SOFT_COMPUTE_URL || 'http://127.0.0.1:8081') + '/version', {
headers: this.apiKey ? { 'RhinoComputeKey': this.apiKey } : {},
signal: controller.signal
});
clearTimeout(timeout);
if (!res.ok) return { ok: false, status: res.status };
const version = await res.text();
return { ok: true, version };
} catch (e) {
return { ok: false, error: e.message };
}
}
};
