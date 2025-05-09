# eml-parse-js

`@tobrien/eml-parse-js` is a JavaScript library for parsing and building EML files, designed for use in browser environments. It provides tools to handle [RFC 822](https://www.w3.org/Protocols/rfc822/) compliant email formats.

[test-badge]: https://github.com/tobrien/eml-parse-js/actions/workflows/test.yml/badge.svg
[test-link]: https://github.com/tobrien/eml-parse-js/actions/workflows/test.yml
[npm-badge]: https://img.shields.io/npm/v/@tobrien/eml-parse-js.svg
[npm-link]: https://www.npmjs.com/package/@tobrien/eml-parse-js
[license-badge]: https://img.shields.io/npm/l/@tobrien/eml-parse-js.svg
[license-link]: https://github.com/tobrien/eml-parse-js/blob/master/LICENSE
[downloads-badge]: https://img.shields.io/npm/dt/@tobrien/eml-parse-js.svg
[downloads-link]: https://www.npmjs.com/package/@tobrien/eml-parse-js
[codecov-badge]: https://codecov.io/gh/tobrien/eml-parse-js/branch/master/graph/badge.svg
[codecov-link]: https://codecov.io/gh/tobrien/eml-parse-js
[snyk-badge]: https://snyk.io/test/github/tobrien/eml-parse-js/badge.svg
[snyk-link]: https://snyk.io/test/github/tobrien/eml-parse-js

## Getting Started

This section will guide you through the initial setup and basic usage of `@tobrien/eml-parse-js`. We'll cover installation and a simple example to get you parsing EML files quickly.


### Installation

To install `@tobrien/eml-parse-js` as a dependency in your project, you can use npm or yarn:

```bash
npm install @tobrien/eml-parse-js
```

or

```bash
yarn add @tobrien/eml-parse-js
```

### Basic Usage

Here's a quick example of how to parse an EML file string and access its content as a JavaScript object:

```javascript
import { readEml } from '@tobrien/eml-parse-js';

const emlString = `Date: Wed, 01 Jan 2020 00:00:00 -0000
From: sender@example.com
To: receiver@example.com
Subject: Hello World

This is the email body.`;

try {
  const emailObject = readEml(emlString);
  console.log('Subject:', emailObject.subject);
  console.log('From:', emailObject.from);
  console.log('To:', emailObject.to);
  console.log('Text Body:', emailObject.text);
} catch (error) {
  console.error('Failed to parse EML:', error);
}
```



## API Usage

This library provides several functions for working with EML files. The primary ones are `parseEml`, `readEml`, and `buildEml`.

### `parseEml(eml: string, options?: OptionOrNull | CallbackFn<ParsedEml>, callback?: CallbackFn<ParsedEml>): string | Error | ParsedEml`

The `parseEml` function takes an EML file content as a string and parses it into a structured JavaScript object. This object, `ParsedEml`, contains the raw headers and body of the email, including all MIME parts.

-   **`eml`**: A string containing the EML file content.
-   **`options`** (optional): An object with parsing options, or a callback function. One common option is `headersOnly: true` to parse only the email headers.
-   **`callback`** (optional): A callback function that will be invoked with `(error, data) => {}`, where `data` is the parsed `ParsedEml` object.

The returned `ParsedEml` object provides a detailed, somewhat raw representation of the EML structure.

```javascript
import { parseEml } from '@tobrien/eml-parse-js';

const emlString = `Date: Thu, 02 Jan 2020 00:00:00 -0000
From: another.sender@example.com
To: another.receiver@example.com
Subject: Test Email for parseEml
Content-Type: text/plain

This is the body of the test email for parseEml.`;

try {
  const parsedEmail = parseEml(emlString);
  console.log('Raw Headers:', parsedEmail.headers);
  // parseEml provides the raw body, which might be a string or structured by MIME parts
  console.log('Raw Body:', parsedEmail.body);
} catch (error) {
  console.error('Failed to parse EML with parseEml:', error);
}
```

### `readEml(eml: string | ParsedEml, options?: OptionOrNull | CallbackFn<EmlContent>, callback?: CallbackFn<EmlContent>): EmlContent | Error | string`

The `readEml` function takes either an EML file content as a string or a `ParsedEml` object (from `parseEml`) and converts it into a more user-friendly `EmlContent` object. This object simplifies access to common email fields like subject, from, to, cc, date, text body, HTML body, and attachments.

-   **`eml`**: A string containing the EML file content or a `ParsedEml` object.
-   **`options`**: Optional settings. Currently, only `headersOnly: boolean` is supported. If true, only headers are parsed.
-   **`callback`**: An optional callback function `(error, data) => {}`, where `data` is the `EmlContent` object.

The `EmlContent` object makes it easier to work with the email's content directly. For example, attachments are processed and their data is made available.

### `buildEml(data: EmlContent | string, options?: BuildOptions | CallbackFn<string> | null, callback?: CallbackFn<string>): string | Error`

The `buildEml` function takes a `EmlContent` object (or an EML string, which it will first parse using `readEml`) and constructs an EML file string. This is useful for creating or modifying emails programmatically.

-   **`data`**: A `EmlContent` object representing the email to be built, or an EML string.
-   **`options`**: Optional settings for building the EML, like encoding preferences (not fully implemented yet).
-   **`callback`**: An optional callback function `(error, data) => {}`, where `data` is the EML string.

This function allows you to assemble an EML message from its constituent parts, including headers, text/HTML bodies, and attachments.

## Fork Notice

This library is a fork of a fork (of maybe about fork.)   And, it was created because it was getting difficult to find something that was well documented and tested for an area that is so fundamental.  This repository originated as a fork of `eml-format-js` (for browser environments) and `eml-format` (for Node.js environments), and was more recently forked from `https://github.com/MQpeng/eml-parse-js`. The primary motivations for this fork include:

*   Fixing issues related to parsing HTML from EML files with `quoted-printable` encoding.
*   Adding support for `base64` encoded data in attachments.
*   Expanding test coverage.
*   Improving documentation.
*   Modernizing the codebase.

## License

MIT License

Copyright (c) 2021 Bean
Copyright (c) 2025 Tim O'Brien

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.