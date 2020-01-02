/**
 * 中/下划线转驼峰
 * @param {string} str 中划线字符串
 * @return {string}
 */
export function lineToCamelCase(str) {
  return typeof str === 'string'
    ? str.replace(/-+\D|_+\D/g, match => match.charAt(match.length - 1).toUpperCase())
    : '';
}

/**
 * css module到处对象key名转驼峰
 * @param {object} obj css module转后的
 * @return {object}
 */
export function cssNameCamelCase(obj) {
  const styleObj = {};
  for (const [key, val] of Object.entries(obj)) {
    styleObj[lineToCamelCase(key)] = val;
  }
  return styleObj;
}
