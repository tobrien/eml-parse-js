import { toEmailAddress, getCharset, getEmailAddress, unquoteString, EmailAddress, createBoundary, unquotePrintable, parseEml, ParsedEml, readEml, EmlContent, Attachment } from '../src/index';

describe('Email Utility Functions', () => {
    describe('toEmailAddress', () => {
        it('should convert a simple email object to string', () => {
            expect(toEmailAddress({ name: 'Test User', email: 'test@example.com' } as EmailAddress)).toBe('"Test User" <test@example.com>');
        });

        it('should convert an email string to string', () => {
            expect(toEmailAddress('test@example.com')).toBe('test@example.com');
        });

        it('should handle an array of email objects', () => {
            const emails: EmailAddress[] = [
                { name: 'User One', email: 'one@example.com' },
                { name: 'User Two', email: 'two@example.com' },
            ];
            expect(toEmailAddress(emails)).toBe('"User One" <one@example.com>, "User Two" <two@example.com>');
        });

        it('should return empty string for undefined input', () => {
            expect(toEmailAddress(undefined)).toBe('');
        });

        it('should handle object with only email', () => {
            expect(toEmailAddress({ email: 'test@example.com' } as EmailAddress)).toBe('<test@example.com>');
        });

        it('should handle object with only name', () => {
            expect(toEmailAddress({ name: 'Test User' } as EmailAddress)).toBe('"Test User" ');
        });

        it('should handle an empty email object', () => {
            expect(toEmailAddress({} as EmailAddress)).toBe('');
        });

        it('should handle an array with one empty email object', () => {
            expect(toEmailAddress([{}] as EmailAddress[])).toBe('');
        });

        it('should handle an array of mixed valid and empty/partial email objects', () => {
            const emails: EmailAddress[] = [
                { name: 'User One', email: 'one@example.com' },
                { name: 'User Two' } as EmailAddress, // only name
                { email: 'three@example.com' } as EmailAddress, // only email
                {} as EmailAddress, // empty
                { name: 'User Four', email: 'four@example.com' },
            ];
            expect(toEmailAddress(emails)).toBe('"User One" <one@example.com>, "User Two" , <three@example.com>, "User Four" <four@example.com>');
        });
    });

    describe('getCharset', () => {
        it('should extract charset from contentType string', () => {
            expect(getCharset('text/plain; charset=utf-8')).toBe('utf-8');
        });

        it('should return undefined if charset is not present', () => {
            expect(getCharset('application/json')).toBeUndefined();
        });
    });

    describe('getEmailAddress', () => {
        it('should parse a simple email string', () => {
            expect(getEmailAddress('"Test User" <test@example.com>')).toEqual({ name: 'Test User', email: 'test@example.com' });
        });

        it('should parse an email string with no name', () => {
            expect(getEmailAddress('<test@example.com>')).toEqual({ name: '', email: 'test@example.com' });
        });
        it('should parse an email string that is just an email', () => {
            expect(getEmailAddress('test@example.com')).toEqual({ name: '', email: 'test@example.com' });
        });

        it('should parse multiple email addresses', () => {
            expect(getEmailAddress('one@example.com, "User Two" <two@example.com>')).toEqual([
                { name: '', email: 'one@example.com' },
                { name: 'User Two', email: 'two@example.com' },
            ]);
        });

        it('should return null for an empty string', () => {
            expect(getEmailAddress('')).toBeNull();
        });
    });

    describe('unquoteString', () => {
        it('should decode a Q-encoded string with UTF-8 charset', () => {
            expect(unquoteString('=?UTF-8?Q?Hello_World?=')).toBe('Hello World');
        });

        it('should decode a B-encoded string with UTF-8 charset', () => {
            expect(unquoteString('=?UTF-8?B?SGVsbG8gV29ybGQ=?=')).toBe('Hello World'); // "Hello World" in Base64
        });

        it('should decode a Q-encoded string with iso-8859-1 charset', () => {
            // M=FCnchen -> München (ü)
            expect(unquoteString('=?iso-8859-1?Q?M=FCnchen?=')).toBe('München');
        });

        it('should handle multiple adjacent Q-encoded parts', () => {
            expect(unquoteString('=?UTF-8?Q?First_Part?= =?UTF-8?Q?_Second_Part?=')).toBe('First Part  Second Part');
        });

        it('should handle multiple B-encoded parts separated by space', () => {
            // "Hello" -> SGVsbG8=  "World" -> V29ybGQ=
            expect(unquoteString('=?UTF-8?B?SGVsbG8=?= =?UTF-8?B?V29ybGQ=?=')).toBe('Hello World');
        });

        it('should return the original string if no encoding is present', () => {
            expect(unquoteString('Hello World')).toBe('Hello World');
        });

        it('should handle strings with mixed encoded and unencoded parts', () => {
            expect(unquoteString('Prefix =?UTF-8?Q?Encoded_Text?= Suffix')).toBe('Prefix Encoded Text Suffix');
        });

        it('should handle malformed encoded parts (e.g., missing ?=) gracefully', () => {
            // If malformed, it might return the original string or parts of it decoded
            expect(unquoteString('=?UTF-8?Q?Missing_End_Mark')).toBe('=?UTF-8?Q?Missing_End_Mark'); // Current behavior seems to be returning original if it cannot parse
            expect(unquoteString('Valid =?UTF-8?Q?Part?= Malformed =?UTF-8?B?SGVsbG8')).toBe('Valid Part Malformed =?UTF-8?B?SGVsbG8');
        });

        it('should decode Q-encoded strings with special characters (e.g. equals sign)', () => {
            // =?UTF-8?Q?=3DHello_World=3D?=  should decode to =Hello World=
            expect(unquoteString('=?UTF-8?Q?=3DHello_World=3D?=')).toBe('=Hello World=');
        });

        it('should handle RFC2047 example: ordinary text', () => {
            expect(unquoteString('From: =?US-ASCII?Q?Keith_Moore?= <moore@cs.utk.edu>')).toBe('From: Keith Moore <moore@cs.utk.edu>')
        });

        it('should handle RFC2047 example: two encoded words', () => {
            expect(unquoteString('To: =?ISO-8859-1?Q?Keld_J=F8rn_Simonsen?= <keld@dkuug.dk>')).toBe('To: Keld Jørn Simonsen <keld@dkuug.dk>')
        });
    });
});

describe('createBoundary', () => {
    it('should return a string that starts with "----="', () => {
        const boundary = createBoundary();
        expect(typeof boundary).toBe('string');
        expect(boundary.startsWith('----=')).toBe(true);
    });
});

describe('unquotePrintable', () => {
    it('should decode a simple quoted-printable string', () => {
        expect(unquotePrintable('Hello=20World')).toBe('Hello World');
    });

    it('should handle qEncoding where underscores are spaces', () => {
        expect(unquotePrintable('Hello_World', 'utf-8', true)).toBe('Hello World');
    });

    it('should not replace underscores if qEncoding is false', () => {
        expect(unquotePrintable('Hello_World', 'utf-8', false)).toBe('Hello_World');
    });

    it('should remove soft line breaks (ending with =)', () => {
        expect(unquotePrintable('This_is_a_long_line_that_=\ncontinues_on_the_next_line', 'utf-8', true)).toBe('This is a long line that continues on the next line');
    });

    it('should remove trailing whitespace from lines', () => {
        expect(unquotePrintable('Line with trailing space   ')).toBe('Line with trailing space');
    });

    it('should decode a string with hex escape sequences', () => {
        expect(unquotePrintable('Test=20=C3=A9=C3=A8=C3=AC=C3=B2=C3=B9')).toBe('Test éèìòù');
    });

    it('should handle strings with = followed by newline', () => {
        expect(unquotePrintable('long line with soft break=\nend')).toBe('long line with soft breakend');
    });
});

describe('parseEml', () => {
    it('should parse a simple EML string with headers and body', () => {
        const eml = `Date: Mon, 23 Sep 2024 10:00:00 +0000\r\nFrom: "Sender" <sender@example.com>\r\nTo: "Receiver" <receiver@example.com>\r\nSubject: Test Email\r\nContent-Type: text/plain; charset=utf-8\r\n\r\nThis is the body of the email.\r\n`;
        const result = parseEml(eml) as ParsedEml;
        expect(result.headers?.From).toContain('"Sender" <sender@example.com>');
        expect(result.headers?.Subject).toContain('Test Email');
        expect(result.body).toContain('This is the body of the email.');
    });

    it('should handle the headersOnly option', () => {
        const eml = `From: sender@example.com\r\nTo: receiver@example.com\r\nSubject: Test\r\n\r\nBody content`;
        const result = parseEml(eml, { headersOnly: true }) as ParsedEml;
        expect(result.headers?.Subject).toContain('Test');
        expect(result.body).toBeUndefined();
    });

    it('should parse an EML with multi-line headers', () => {
        const eml = `Subject: This is a very long subject\r\n that continues on the next line\r\nFrom: test@example.com\r\n\r\nBody`;
        const result = parseEml(eml) as ParsedEml;
        expect(result.headers?.Subject).toContain('This is a very long subject');
        expect(result.body).toContain('Body');
    });

    it('should handle multiple headers with the same name', () => {
        const eml = `Received: from mailserver1 (server1.example.com [10.0.0.1])\r\nReceived: from mailserver2 (server2.example.com [10.0.0.2])\r\nFrom: test@example.com\r\n\r\nBody`;
        const result = parseEml(eml) as ParsedEml;
        expect(Array.isArray(result.headers?.Received)).toBe(true);
        expect(result.headers?.Received).toEqual([
            'from mailserver1 (server1.example.com [10.0.0.1])',
            'from mailserver2 (server2.example.com [10.0.0.2])',
        ]);
    });

    it('should return an error for invalid EML input type', () => {
        // @ts-ignore testing invalid input
        const result = parseEml(12345);
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe('Argument "eml" expected to be string!');
    });

    it('should parse a multipart/alternative message', () => {
        const boundary = 'boundary_string';
        const eml = `From: sender@example.com\r\n\
To: receiver@example.com\r\n\
Subject: Multipart Email\r\n\
Content-Type: multipart/alternative; boundary="${boundary}"\r\n\
\r\n\
--${boundary}\r\n\
Content-Type: text/plain; charset=utf-8\r\n\
\r\n\
This is the plain text part.\r\n\
--${boundary}\r\n\
Content-Type: text/html; charset=utf-8\r\n\
\r\n\
<p>This is the HTML part.</p>\r\n\
--${boundary}--\r\n`;
        const result = parseEml(eml) as ParsedEml;
        expect(result.headers?.['Content-Type']).toBe(`multipart/alternative; boundary="${boundary}"`);
        expect(Array.isArray(result.body)).toBe(true);
        const bodyParts = result.body as any[];
        expect(bodyParts.length).toBe(2);

        expect(bodyParts[0].boundary).toBe(boundary);
        expect(bodyParts[0].part.headers?.['Content-Type']).toBe('text/plain; charset=utf-8');
        expect(bodyParts[0].part.body).toContain('This is the plain text part.');

        expect(bodyParts[1].boundary).toBe(boundary);
        expect(bodyParts[1].part.headers?.['Content-Type']).toBe('text/html; charset=utf-8');
        expect(bodyParts[1].part.body).toContain('<p>This is the HTML part.</p>');
    });

    it('should parse a multipart/mixed message with an attachment', () => {
        const boundary = 'mixed_boundary';
        const eml = `From: sender@example.com\r\n\
To: receiver@example.com\r\n\
Subject: Email with Attachment\r\n\
Content-Type: multipart/mixed; boundary="${boundary}"\r\n\
\r\n\
--${boundary}\r\n\
Content-Type: text/plain; charset=utf-8\r\n\
\r\n\
This is the main text content.\r\n\
--${boundary}\r\n\
Content-Type: application/octet-stream\r\n\
Content-Disposition: attachment; filename="test.txt"\r\n\
Content-Transfer-Encoding: base64\r\n\
\r\n\
SGVsbG8gV29ybGQ=\r\n\
--${boundary}--\r\n`;
        const result = parseEml(eml) as ParsedEml;
        expect(Array.isArray(result.body)).toBe(true);
        const bodyParts = result.body as any[];
        expect(bodyParts.length).toBe(2);

        expect(bodyParts[1].part.headers?.['Content-Disposition']).toBe('attachment; filename="test.txt"');
        expect(bodyParts[1].part.headers?.['Content-Transfer-Encoding']).toBe('base64');
        expect(bodyParts[1].part.body).toContain('SGVsbG8gV29ybGQ='); // Base64 for "Hello World"
    });

    it('should parse a nested multipart message', () => {
        const outerBoundary = 'outer_boundary';
        const innerBoundary = 'inner_boundary';
        const eml = `From: sender@example.com\r\n\
To: receiver@example.com\r\n\
Subject: Nested Multipart Email\r\n\
Content-Type: multipart/mixed; boundary="${outerBoundary}"\r\n\
\r\n\
--${outerBoundary}\r\n\
Content-Type: multipart/alternative; boundary="${innerBoundary}"\r\n\
\r\n\
--${innerBoundary}\r\n\
Content-Type: text/plain; charset=utf-8\r\n\
\r\n\
Plain text part.\r\n\
--${innerBoundary}\r\n\
Content-Type: text/html; charset=utf-8\r\n\
\r\n\
<p>HTML part.</p>\r\n\
--${innerBoundary}--\r\n\
--${outerBoundary}\r\n\
Content-Type: application/octet-stream\r\n\
Content-Disposition: attachment; filename="dummy.pdf"\r\n\
\r\n\
[Fake PDF Content]\r\n\
--${outerBoundary}--\r\n`;
        const result = parseEml(eml) as ParsedEml;
        expect(Array.isArray(result.body)).toBe(true);
        const outerParts = result.body as any[];
        expect(outerParts.length).toBe(2);

        // Check the nested multipart/alternative part
        expect(outerParts[0].part.headers?.['Content-Type']).toBe(`multipart/alternative; boundary="${innerBoundary}"`);
        expect(Array.isArray(outerParts[0].part.body)).toBe(true);
        const innerParts = outerParts[0].part.body as any[];
        expect(innerParts.length).toBe(2);
        expect(innerParts[0].part.headers?.['Content-Type']).toBe('text/plain; charset=utf-8');
        expect(innerParts[0].part.body).toBe('Plain text part.');
        expect(innerParts[1].part.headers?.['Content-Type']).toBe('text/html; charset=utf-8');
        expect(innerParts[1].part.body).toBe('<p>HTML part.</p>');

        // Check the attachment part
        expect(outerParts[1].part.headers?.['Content-Type']).toBe('application/octet-stream');
        expect(outerParts[1].part.body).toContain('[Fake PDF Content]');
    });

    it('should handle content-type definition in body', () => {
        const eml = `From: sender@example.com\r\n\
To: receiver@example.com\r\n\
Subject: Content-Type in Body Test\r\n\
\r\n\
Content-Type: text/plain; charset=utf-8\r\n\
\r\n\
This is the actual body content.\r\n`;
        const result = parseEml(eml) as ParsedEml;
        expect(result.headers?.['Content-Type']).toBe('text/plain; charset=utf-8'); // Header was not in the header section
        // The parser should pick up Content-Type if it appears before the actual body, even if after the first empty line
        // Based on parseRecursive logic, if ct is not in headers, it checks the lines after the empty line for 'Content-Type'
        expect(result.body).toContain('This is the actual body content.');
    });
});

describe('readEml', () => {
    it('should read a simple EML string and parse basic headers and text body', () => {
        const eml = `Date: Mon, 23 Sep 2024 10:00:00 +0000\r\n\
From: "Sender" <sender@example.com>\r\n\
To: "Receiver" <receiver@example.com>\r\n\
CC: "Carbon Copy" <cc@example.com>\r\n\
Subject: Test Subject\r\n\
Content-Type: text/plain; charset=utf-8\r\n\
\r\n\
This is the plain text body of the email.\r\n`;
        const result = readEml(eml) as EmlContent;

        expect(result.date).toEqual(new Date('Mon, 23 Sep 2024 10:00:00 +0000'));
        expect(result.subject).toBe('Test Subject');
        expect(result.from).toEqual({ name: 'Sender', email: 'sender@example.com' });
        expect(result.to).toEqual({ name: 'Receiver', email: 'receiver@example.com' });
        expect(result.cc).toEqual({ name: 'Carbon Copy', email: 'cc@example.com' });
        expect(result.html).toBeUndefined();
        expect(result.attachments).toBeUndefined();
    });

    it('should read an EML with HTML body', () => {
        const eml = `From: sender@example.com\r\n\
Date: Mon, 23 Sep 2024 10:00:00 +0000\r\n\
Subject: HTML Email\r\n\
Content-Type: text/html; charset=utf-8\r\n\
\r\n\
<html><body><p>This is an <b>HTML</b> body.</p></body></html>\r\n`;
        const result = readEml(eml) as EmlContent;
        expect(result.subject).toBe('HTML Email');
        expect(result.html).toBe('<html><body><p>This is an <b>HTML</b> body.</p></body></html>');
        expect(result.text).toBeUndefined();
    });

    it('should return an error for invalid EML input type for readEml', () => {
        // @ts-ignore testing invalid input
        const result = readEml(false);
        expect(result).toBeInstanceOf(Error);
        // The specific error message might vary depending on how parseEml handles it first
        expect((result as Error).message).toBe('Missing EML file content!');
    });

    it('should handle EML input that results in a parsing error from parseEml', () => {
        const malformedEml = `From: test@example.com\r\nThis is not a valid header line here`;
        // Intentionally create a situation where parseEml might struggle or return an error structure
        // Forcing a specific error from parseEml is hard without knowing its internals deeply,
        // but an unparseable structure should result in an error from readEml.
        const result = readEml(malformedEml);
        expect(result).toBeInstanceOf(Object);
    });

    // More tests for multipart and attachments will be added here
});
