'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WeekdayPropTypes = undefined;

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _PropTypes = require('./PropTypes');

var _PropTypes2 = _interopRequireDefault(_PropTypes);

var _defaultStyles = require('./defaultStyles');

var _defaultStyles2 = _interopRequireDefault(_defaultStyles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Weekday = function Weekday(_ref) {
  var weekday = _ref.weekday,
      style = _ref.style,
      weekdaysLong = _ref.weekdaysLong,
      weekdaysShort = _ref.weekdaysShort,
      localeUtils = _ref.localeUtils,
      locale = _ref.locale;

  var title = void 0;
  if (weekdaysLong) {
    title = weekdaysLong[weekday];
  } else {
    title = localeUtils.formatWeekdayLong(weekday, locale);
  }
  var content = void 0;
  if (weekdaysShort) {
    content = weekdaysShort[weekday];
  } else {
    content = localeUtils.formatWeekdayShort(weekday, locale);
  }

  return _react2.default.createElement(
    'div',
    { style: [_defaultStyles2.default.weekday, style], role: 'columnheader' },
    _react2.default.createElement(
      'abbr',
      { title: title },
      content
    )
  );
};

exports.default = (0, _radium2.default)(Weekday);
var WeekdayPropTypes = exports.WeekdayPropTypes = {
  weekday: _react.PropTypes.number,
  style: _react.PropTypes.object,
  locale: _react.PropTypes.string,
  localeUtils: _PropTypes2.default.localeUtils,

  weekdaysLong: _react.PropTypes.arrayOf(_react.PropTypes.string),
  weekdaysShort: _react.PropTypes.arrayOf(_react.PropTypes.string)
};

Weekday.propTypes = WeekdayPropTypes;
//# sourceMappingURL=Weekday.js.map