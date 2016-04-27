'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebSocketGremlinConnection = function (_EventEmitter) {
  _inherits(WebSocketGremlinConnection, _EventEmitter);

  function WebSocketGremlinConnection(_ref) {
    var port = _ref.port;
    var host = _ref.host;
    var path = _ref.path;
    var tls = _ref.tls;

    _classCallCheck(this, WebSocketGremlinConnection);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WebSocketGremlinConnection).call(this));

    _this.open = false;
    _this.protocol = tls ? 'wss' : 'ws';
    _this.ws = new _ws2.default(_this.protocol + ('://' + host + ':' + port + path));

    _this.ws.onopen = function () {
      return _this.onOpen();
    };
    _this.ws.onerror = function (err) {
      return _this.handleError(err);
    };
    _this.ws.onmessage = function (message) {
      return _this.handleMessage(message);
    };
    _this.ws.onclose = function (event) {
      return _this.onClose(event);
    };
    _this.ws.binaryType = "arraybuffer";
    return _this;
  }

  _createClass(WebSocketGremlinConnection, [{
    key: 'onOpen',
    value: function onOpen() {
      this.open = true;
      this.emit('open');
    }
  }, {
    key: 'handleError',
    value: function handleError(err) {
      this.emit('error', err);
    }
  }, {
    key: 'handleMessage',
    value: function handleMessage(message) {
      this.emit('message', message);
    }
  }, {
    key: 'onClose',
    value: function onClose(event) {
      this.open = false;
      this.emit('close', event);
    }
  }, {
    key: 'sendMessage',
    value: function sendMessage(message) {
      var _this2 = this;

      this.ws.send(message, { mask: true, binary: true }, function (err) {
        if (err) {
          _this2.handleError(err);
        }
      });
    }
  }]);

  return WebSocketGremlinConnection;
}(_events.EventEmitter);

exports.default = WebSocketGremlinConnection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9XZWJTb2NrZXRHcmVtbGluQ29ubmVjdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOztBQUVBOzs7Ozs7Ozs7Ozs7SUFHcUI7OztBQUNuQixXQURtQiwwQkFDbkIsT0FBdUM7UUFBekIsaUJBQXlCO1FBQW5CLGlCQUFtQjtRQUFiLGlCQUFhO1FBQVAsZUFBTzs7MEJBRHBCLDRCQUNvQjs7dUVBRHBCLHdDQUNvQjs7QUFHckMsVUFBSyxJQUFMLEdBQVksS0FBWixDQUhxQztBQUlyQyxVQUFLLFFBQUwsR0FBZ0IsTUFBTSxLQUFOLEdBQWMsSUFBZCxDQUpxQjtBQUtyQyxVQUFLLEVBQUwsR0FBVSxpQkFBYyxNQUFLLFFBQUwsWUFBc0IsYUFBUSxPQUFPLEtBQXJDLENBQXhCLENBTHFDOztBQU9yQyxVQUFLLEVBQUwsQ0FBUSxNQUFSLEdBQWlCO2FBQU0sTUFBSyxNQUFMO0tBQU4sQ0FQb0I7QUFRckMsVUFBSyxFQUFMLENBQVEsT0FBUixHQUFrQixVQUFDLEdBQUQ7YUFBUyxNQUFLLFdBQUwsQ0FBaUIsR0FBakI7S0FBVCxDQVJtQjtBQVNyQyxVQUFLLEVBQUwsQ0FBUSxTQUFSLEdBQW9CLFVBQUMsT0FBRDthQUFhLE1BQUssYUFBTCxDQUFtQixPQUFuQjtLQUFiLENBVGlCO0FBVXJDLFVBQUssRUFBTCxDQUFRLE9BQVIsR0FBa0IsVUFBQyxLQUFEO2FBQVcsTUFBSyxPQUFMLENBQWEsS0FBYjtLQUFYLENBVm1CO0FBV3JDLFVBQUssRUFBTCxDQUFRLFVBQVIsR0FBcUIsYUFBckIsQ0FYcUM7O0dBQXZDOztlQURtQjs7NkJBZVY7QUFDUCxXQUFLLElBQUwsR0FBWSxJQUFaLENBRE87QUFFUCxXQUFLLElBQUwsQ0FBVSxNQUFWLEVBRk87Ozs7Z0NBS0csS0FBSztBQUNmLFdBQUssSUFBTCxDQUFVLE9BQVYsRUFBbUIsR0FBbkIsRUFEZTs7OztrQ0FJSCxTQUFTO0FBQ3JCLFdBQUssSUFBTCxDQUFVLFNBQVYsRUFBcUIsT0FBckIsRUFEcUI7Ozs7NEJBSWYsT0FBTztBQUNiLFdBQUssSUFBTCxHQUFZLEtBQVosQ0FEYTtBQUViLFdBQUssSUFBTCxDQUFVLE9BQVYsRUFBbUIsS0FBbkIsRUFGYTs7OztnQ0FLSCxTQUFTOzs7QUFDbkIsV0FBSyxFQUFMLENBQVEsSUFBUixDQUFhLE9BQWIsRUFBc0IsRUFBRSxNQUFNLElBQU4sRUFBWSxRQUFRLElBQVIsRUFBcEMsRUFBb0QsVUFBQyxHQUFELEVBQVM7QUFDM0QsWUFBSSxHQUFKLEVBQVM7QUFDUCxpQkFBSyxXQUFMLENBQWlCLEdBQWpCLEVBRE87U0FBVDtPQURrRCxDQUFwRCxDQURtQjs7OztTQWpDRiIsImZpbGUiOiJXZWJTb2NrZXRHcmVtbGluQ29ubmVjdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5cbmltcG9ydCBXZWJTb2NrZXQgZnJvbSAnd3MnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdlYlNvY2tldEdyZW1saW5Db25uZWN0aW9uIGV4dGVuZHMgRXZlbnRFbWl0dGVywqB7XG4gIGNvbnN0cnVjdG9yKHsgcG9ydCwgaG9zdCwgcGF0aCwgdGxzIH0pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgdGhpcy5wcm90b2NvbCA9IHRscyA/ICd3c3MnIDogJ3dzJztcbiAgICB0aGlzLndzID0gbmV3IFdlYlNvY2tldCh0aGlzLnByb3RvY29sICsgYDovLyR7aG9zdH06JHtwb3J0fSR7cGF0aH1gKTtcblxuICAgIHRoaXMud3Mub25vcGVuID0gKCkgPT4gdGhpcy5vbk9wZW4oKTtcbiAgICB0aGlzLndzLm9uZXJyb3IgPSAoZXJyKSA9PiB0aGlzLmhhbmRsZUVycm9yKGVycik7XG4gICAgdGhpcy53cy5vbm1lc3NhZ2UgPSAobWVzc2FnZSkgPT4gdGhpcy5oYW5kbGVNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIHRoaXMud3Mub25jbG9zZSA9IChldmVudCkgPT4gdGhpcy5vbkNsb3NlKGV2ZW50KTtcbiAgICB0aGlzLndzLmJpbmFyeVR5cGUgPSBcImFycmF5YnVmZmVyXCI7XG4gIH1cblxuICBvbk9wZW4oKSB7XG4gICAgdGhpcy5vcGVuID0gdHJ1ZTtcbiAgICB0aGlzLmVtaXQoJ29wZW4nKTtcbiAgfVxuXG4gIGhhbmRsZUVycm9yKGVycikge1xuICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICB9XG5cbiAgaGFuZGxlTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgdGhpcy5lbWl0KCdtZXNzYWdlJywgbWVzc2FnZSk7XG4gIH1cblxuICBvbkNsb3NlKGV2ZW50KSB7XG4gICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgdGhpcy5lbWl0KCdjbG9zZScsIGV2ZW50KTtcbiAgfVxuXG4gIHNlbmRNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICB0aGlzLndzLnNlbmQobWVzc2FnZSwgeyBtYXNrOiB0cnVlLCBiaW5hcnk6IHRydWUgfSwgKGVycikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICB0aGlzLmhhbmRsZUVycm9yKGVycik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==