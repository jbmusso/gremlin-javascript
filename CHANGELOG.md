## 0.3.0
- `client.stream()` now re-emits one distinct `data` event per result fetched instead of emiting an array of results
- `client.execute()` now internally uses a stream to buffer partial results before firing the provided callback
- Add `client.messageStream()` which returns a stream of raw response messages returned by Gremlin Server

## 0.2.1
- Update dependencies
- Fix examples to match latest API changes

## 0.2.0
- Update `client.stream()` 'data' event signature to (result, message) from (message)
- Update `client.execute()` callback signature to (err, result, lastMessage, command) from (err, message)
- Remove Stream 'result' event
- Allow overriding low level messages on a per request basis
- Add client options for `op`, `processor` and `accept`

## 0.1.2
- allow sending commands after the client is connected

## 0.1.1
- properly handle new and last command messages with status codes

## 0.1.0
- support nashorn script engine
- add bound parameters
- add sessions (@gmeral)

## 0.0.0
- initial release with `.stream()`, `.execute()` and support for Groovy flavored scripts