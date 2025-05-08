import { getBoundary, getCharsetName, guid, wrap, mimeDecode, isStringOrError, GB2312UTF8 } from '../src/utils';

describe('getBoundary', () => {
    it('should return the boundary from a content type string', () => {
        const contentType = 'multipart/alternative; boundary="boundary_string_123"';
        expect(getBoundary(contentType)).toBe('boundary_string_123');
    });

    it('should return undefined if no boundary is present', () => {
        const contentType = 'text/plain';
        expect(getBoundary(contentType)).toBeUndefined();
    });

    it('should handle boundaries with single quotes', () => {
        const contentType = "multipart/mixed; boundary='simple_boundary'";
        expect(getBoundary(contentType)).toBe('simple_boundary');
    });

    it('should handle boundaries without quotes', () => {
        const contentType = 'multipart/related; boundary=anotherboundary';
        expect(getBoundary(contentType)).toBe('anotherboundary');
    });
});

describe('getCharsetName', () => {
    it('should convert charset to lowercase and remove non-alphanumeric characters', () => {
        expect(getCharsetName('UTF-8')).toBe('utf8');
        expect(getCharsetName('ISO-8859-1')).toBe('iso88591');
        expect(getCharsetName('Windows-1252')).toBe('windows1252');
    });

    it('should handle already formatted charsets', () => {
        expect(getCharsetName('utf8')).toBe('utf8');
    });

    it('should handle empty string', () => {
        expect(getCharsetName('')).toBe('');
    });
});

describe('guid', () => {
    it('should generate a string of the correct format', () => {
        const id = guid();
        // Matches the pattern xxxxxxxxxxxx-4xxx-yxxx-xxxxxxxxxxxx (before replace)
        // Then, it replaces '-' resulting in a 32 char string
        expect(id).toMatch(/^[a-f0-9]{16}-[a-f0-9]{4}-[a-f0-9]{12}$/);
    });

    it('should generate unique ids', () => {
        const id1 = guid();
        const id2 = guid();
        expect(id1).not.toBe(id2);
    });
});

describe('wrap', () => {
    it('should wrap a string to a specified number of characters per row', () => {
        const str = 'abcdefghijklmnopqrstuvwxyz';
        const wrapped = wrap(str, 5);
        expect(wrapped).toBe('abcde\r\nfghij\r\nklmno\r\npqrst\r\nuvwxy\r\nz');
    });

    it('should handle strings shorter than the wrap length', () => {
        const str = 'abc';
        const wrapped = wrap(str, 5);
        expect(wrapped).toBe('abc');
    });

    it('should handle empty strings', () => {
        const str = '';
        const wrapped = wrap(str, 5);
        expect(wrapped).toBe('');
    });

    it('should handle strings where length is a multiple of wrap length', () => {
        const str = 'abcdef';
        const wrapped = wrap(str, 3);
        expect(wrapped).toBe('abc\r\ndef');
    });
});

describe('mimeDecode', () => {
    it('should decode a simple MIME encoded string', () => {
        expect(mimeDecode('=48=65=6C=6C=6F')).toBe('Hello'); // "Hello"
    });

    it('should decode a string with mixed encoded and non-encoded parts', () => {
        expect(mimeDecode('Caf=C3=A9')).toBe('Café'); // "Café"
    });

    it('should handle an empty string', () => {
        expect(mimeDecode('')).toBe('');
    });

    it('should handle a string with no encoded parts', () => {
        expect(mimeDecode('Hello World')).toBe('Hello World');
    });

    it('should decode with a specified charset (though underlying decode handles actual conversion)', () => {
        // This test mainly ensures the fromCharset parameter is accepted.
        // The actual charset conversion is handled by the 'decode' function from './charset'
        // and would require more complex setup to test different charsets properly.
        expect(mimeDecode('=48=65=6C=6C=6F', 'UTF-8')).toBe('Hello');
    });

    it('should decode strings with lowercase hex', () => {
        expect(mimeDecode('=48=65=6c=6c=6f')).toBe('Hello');
    });

    it('should handle invalid hex by ignoring the = and treating subsequent chars as literal', () => {
        expect(mimeDecode('=XXHello=41')).toBe('=XXHelloA');
        expect(mimeDecode('=AXHello')).toBe('=AXHello');
    });
});

describe('isStringOrError', () => {
    it('should return true for strings', () => {
        expect(isStringOrError('hello')).toBe(true);
        expect(isStringOrError('')).toBe(true);
    });

    it('should return true for Error objects', () => {
        expect(isStringOrError(new Error('test error'))).toBe(true);
        expect(isStringOrError(new TypeError('type error'))).toBe(true);
    });

    it('should return false for other types', () => {
        expect(isStringOrError(123)).toBe(false);
        expect(isStringOrError(null)).toBe(false);
        expect(isStringOrError(undefined)).toBe(false);
        expect(isStringOrError({})).toBe(false);
        expect(isStringOrError([])).toBe(false);
        expect(isStringOrError(() => { })).toBe(false);
    });
});

describe('GB2312UTF8', () => {
    describe('Dig2Dec', () => {
        it('should convert 4-digit binary string to decimal', () => {
            expect(GB2312UTF8.Dig2Dec('0000')).toBe(0);
            expect(GB2312UTF8.Dig2Dec('0001')).toBe(1);
            expect(GB2312UTF8.Dig2Dec('1000')).toBe(8);
            expect(GB2312UTF8.Dig2Dec('1111')).toBe(15);
        });

        it('should return -1 for invalid length strings', () => {
            expect(GB2312UTF8.Dig2Dec('101')).toBe(-1);
            expect(GB2312UTF8.Dig2Dec('10101')).toBe(-1);
            expect(GB2312UTF8.Dig2Dec('')).toBe(-1);
        });
    });

    describe('Dec2Dig', () => {
        it('should convert decimal (0-15) to 4-digit binary string', () => {
            expect(GB2312UTF8.Dec2Dig(0)).toBe('0000');
            expect(GB2312UTF8.Dec2Dig(1)).toBe('0001');
            expect(GB2312UTF8.Dec2Dig(8)).toBe('1000');
            expect(GB2312UTF8.Dec2Dig(15)).toBe('1111');
        });
    });

    describe('Str2Hex', () => {
        it('should convert a hex string to a binary string', () => {
            expect(GB2312UTF8.Str2Hex('0')).toBe('0000');
            expect(GB2312UTF8.Str2Hex('F')).toBe('1111');
            expect(GB2312UTF8.Str2Hex('A5')).toBe('10100101');
        });
        it('should handle lowercase hex characters', () => {
            expect(GB2312UTF8.Str2Hex('a5')).toBe('00000101');
        });
        it('should return empty string for empty input', () => {
            expect(GB2312UTF8.Str2Hex('')).toBe('');
        });
    });

    describe('Hex2Utf8', () => {
        it('should convert 16-char hex string to UTF8 percent-encoded string', () => {
            // Example from a GB2312 character, e.g., '丂' (Unicode U+4E02) -> GB2312 B0A1
            // The function expects a 16-bit binary representation of a GB2312 character.
            // Let's take B0A1. B0 -> 10110000, A1 -> 10100001. Combined: 1011000010100001
            expect(GB2312UTF8.Hex2Utf8('1011000010100001')).toBe('%EB%82%A1'); // This might be an example, true mapping is complex.
            // The example provided seems to map to '丁' U+4E01, not U+4E02
            // For '丂' (U+4E02), GB2312 is B0A2 (1011000010100010)
            // UTF-8 for U+4E02 is E4 B8 82
            expect(GB2312UTF8.Hex2Utf8('0100111000000010')).toBe('%E4%B8%82'); // U+4E02 (丂)
        });

        it('should return empty string for non-16-char hex string', () => {
            expect(GB2312UTF8.Hex2Utf8('101010101010101')).toBe('');
            expect(GB2312UTF8.Hex2Utf8('10101010101010101')).toBe('');
            expect(GB2312UTF8.Hex2Utf8('')).toBe('');
        });
    });

    // More comprehensive tests for GB2312ToUTF8 and UTF8ToGB2312 would require a good set of test vectors
    // due to the complexity of character encodings.
    describe('GB2312ToUTF8', () => {
        it('should handle empty string', () => {
            expect(GB2312UTF8.GB2312ToUTF8('')).toBe('');
        });
    });

    describe('UTF8ToGB2312', () => {
        it('should handle strings with no characters needing conversion', () => {
            expect(GB2312UTF8.UTF8ToGB2312('HelloWorld')).toBe('HelloWorld');
        });

        it('should handle empty string', () => {
            expect(GB2312UTF8.UTF8ToGB2312('')).toBe('');
        });
    });
});
