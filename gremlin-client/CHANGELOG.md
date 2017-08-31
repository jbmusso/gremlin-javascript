## 2.6.0
- Add support for SASL authentication (thanks CosmosDB team)

## 2.5.1
- Push properly built files

## 2.5.0
- Support secure WebSockets

## 2.4.0
- Partial support for Gremlin-JavaScript language variant
- Update `ws` to `2.3.1`
- Freeze dependencies with yarn.lock file

## 2.3.3
- Update `ws` to `v1.1.1`, fix issue when sending many queries. See #60 #74 (@princjef)
- Fix issues when receiving orphaned responses. See #73 (@princjef)

## 2.3.2
- Fix an issue with payloads containing utf8 special characters (@PommeVerte)

## 2.3.1
- Fix a missing feature from previous release

## 2.3.0
- Add support for graph aliases
- Add `bindForClient()` utility function
- Improvement: handle incoming messages as binary (@PommeVerte)
- Add Travis CI (@PommeVerte)
- Fix examples (@guyellis)

## 2.2.0
- Add `path` option for setting custom URL connection path
- Fix: delete pending commands for all received messages except Code 206

## 2.1.0
- Add support for execution of query object supporting TinkerPop3 protocol-level signature (shape: `{ gremlin: <String>, bindings: <Object> }`)

## 2.0.1
- Remap 'undefined' bindings as 'null' values, preventing Gremlin script execution failures

## 2.0.0
- Rename package to gremlin

## 1.0.3
- Generate UUID using `node-uuid` instead of `guid`

## 1.0.2
- Properly terminate the stream when handling a 204 NO_CONTENT code (fix #17)

## 1.0.1
- Fix an issue when require'ing with lodash under Linux systems

## 1.0.0
- Support TinkerPop v3.0.0

## 0.3.1
- Handle new response format
- Better error handling in callback mode
- Add support for sessions with arbitrary processors

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
