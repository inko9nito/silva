// TEMPORARY: auth is stubbed out while the passphrase gate is disabled.
// The client-side interface stays identical so we can restore it later.

export async function initAuth() {}
export function hasValidToken() { return true; }
export async function getToken() { return 'open'; }
export function currentProfile() { return null; }
export function signOut() {}
export function submitPassphrase() {}
export async function verifyPassphrase() { return true; }
export function markInvalid() {}
