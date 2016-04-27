'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _readableStream = require('readable-stream');

var _readableStream2 = _interopRequireDefault(_readableStream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MessageStream = function (_ReadableStream) {
  _inherits(MessageStream, _ReadableStream);

  function MessageStream() {
    var _Object$getPrototypeO;

    _classCallCheck(this, MessageStream);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(MessageStream)).call.apply(_Object$getPrototypeO, [this].concat(args)));
  }

  _createClass(MessageStream, [{
    key: '_read',
    value: function _read() {
      this._paused = false;
    }
  }]);

  return MessageStream;
}(_readableStream2.default);

exports.default = MessageStream;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9NZXNzYWdlU3RyZWFtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7OztJQUdNOzs7QUFDSixXQURJLGFBQ0osR0FBcUI7OzswQkFEakIsZUFDaUI7O3NDQUFOOztLQUFNOzsyRkFEakIsZ0VBRU8sUUFEVTtHQUFyQjs7ZUFESTs7NEJBS0k7QUFDTixXQUFLLE9BQUwsR0FBZSxLQUFmLENBRE07Ozs7U0FMSjs7O2tCQVVTIiwiZmlsZSI6Ik1lc3NhZ2VTdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhZGFibGVTdHJlYW0gZnJvbSAncmVhZGFibGUtc3RyZWFtJztcblxuXG5jbGFzcyBNZXNzYWdlU3RyZWFtIGV4dGVuZHMgUmVhZGFibGVTdHJlYW0ge1xuICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgc3VwZXIoLi4uYXJncylcbiAgfVxuXG4gIF9yZWFkKCkge1xuICAgIHRoaXMuX3BhdXNlZCA9IGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1lc3NhZ2VTdHJlYW07XG4iXX0=