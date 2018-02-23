// constants
const b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const b64tab = {}
for (let i = 0; i < b64chars.length; i++) {
  b64tab[b64chars.charAt(i)] = i
}
const fromCharCode = String.fromCharCode

function utob(u) {
  // eslint-disable-next-line no-control-regex
  const re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g
  return u.replace(re_utob, c => {
    if (c.length < 2) {
      const cc = c.charCodeAt(0)
      if (cc < 0x80) {
        return c
      } else if (cc < 0x800) {
        return fromCharCode(0xc0 | (cc >>> 6)) +
          fromCharCode(0x80 | (cc & 0x3f))
      } else {
        return fromCharCode(0xe0 | ((cc >>> 12) & 0x0f)) +
          fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) +
          fromCharCode(0x80 | (cc & 0x3f))
      }
    } else {
      const cc = 0x10000 +
        (c.charCodeAt(0) - 0xD800) * 0x400 +
        (c.charCodeAt(1) - 0xDC00)
      return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07)) +
        fromCharCode(0x80 | ((cc >>> 12) & 0x3f)) +
        fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) +
        fromCharCode(0x80 | (cc & 0x3f)))
    }
  })
}

function btou(b) {
  const re_btou = new RegExp([
    '[\xC0-\xDF][\x80-\xBF]',
    '[\xE0-\xEF][\x80-\xBF]{2}',
    '[\xF0-\xF7][\x80-\xBF]{3}'
  ].join('|'), 'g')
  return b.replace(re_btou, s => {
    if (s.length === 4) {
      const cp = ((0x07 & s.charCodeAt(0)) << 18) |
        ((0x3f & s.charCodeAt(1)) << 12) |
        ((0x3f & s.charCodeAt(2)) << 6) |
        (0x3f & s.charCodeAt(3))
      const offset = cp - 0x10000
      return fromCharCode((offset >>> 10) + 0xD800) +
        fromCharCode((offset & 0x3FF) + 0xDC00)
    } else if (s.length === 3) {
      return fromCharCode(
        ((0x0f & s.charCodeAt(0)) << 12) |
        ((0x3f & s.charCodeAt(1)) << 6) |
        (0x3f & s.charCodeAt(2))
      )
    } else {
      return fromCharCode(
        ((0x1f & s.charCodeAt(0)) << 6) |
        (0x3f & s.charCodeAt(1))
      )
    }
  })
}

const btoa = window.btoa ? function(b) {
  return window.btoa(b)
} : function(b) {
  return b.replace(/[\s\S]{1,3}/g, ccc => {
    const padlen = [0, 2, 1][ccc.length % 3]
    const ord = ccc.charCodeAt(0) << 16 |
      ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8) |
      ((ccc.length > 2 ? ccc.charCodeAt(2) : 0))
    const chars = [
      b64chars.charAt(ord >>> 18),
      b64chars.charAt((ord >>> 12) & 63),
      padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
      padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
    ]
    return chars.join('')
  })
}

const atob = window.atob ? function(a) {
  return window.atob(a)
} : function(a) {
  return a.replace(/[\s\S]{1,4}/g, s => {
    const len = s.length
    const padlen = len % 4
    const n = (len > 0 ? b64tab[s.charAt(0)] << 18 : 0) |
      (len > 1 ? b64tab[s.charAt(1)] << 12 : 0) |
      (len > 2 ? b64tab[s.charAt(2)] << 6 : 0) |
      (len > 3 ? b64tab[s.charAt(3)] : 0)
    const chars = [
      fromCharCode(n >>> 16),
      fromCharCode((n >>> 8) & 0xff),
      fromCharCode(n & 0xff)
    ]
    chars.length -= [0, 0, 2, 1][padlen]
    return chars.join('')
  })
}

function encode(u, urisafe = false) {
  if (urisafe) {
    return btoa(utob(String(u))).replace(/[+/]/g, m0 => {
      return m0 === '+' ? '-' : '_'
    }).replace(/=/g, '')
  }
  return btoa(utob(String(u)))
}

function encodeURI(u) {
  return encode(u, true)
}

function decode(a) {
  return btou(atob((String(a).replace(/[-_]/g, m0 => {
    return m0 === '-' ? '+' : '/'
  }).replace(/[^A-Za-z0-9+/]/g, ''))))
}

const base64 = {
  atob,
  btoa,
  utob,
  encode,
  encodeURI,
  btou,
  decode,
}

export default base64
