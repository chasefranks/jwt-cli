export const isExpired = (seconds) => {
    let now = new Date();
    if (seconds * 1000 < now.getTime()) {
        return true;
    } else {
        return false;
    }
}
