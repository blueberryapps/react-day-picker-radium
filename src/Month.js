import Radium from 'radium';
import React, { PropTypes } from 'react';
import DayPickerPropTypes from './PropTypes';
import Weekdays from './Weekdays';
import defaultStyles from './defaultStyles';
import { getWeekArray } from './Helpers';

const Month = ({
  classNames,

  month,
  months,

  fixedWeeks,
  captionElement,
  weekdayElement,

  locale,
  localeUtils,
  weekdaysLong,
  weekdaysShort,
  firstDayOfWeek,

  onCaptionClick,
  children,
}) => {
  const captionProps = {
    date: month,
    classNames,
    months,
    localeUtils,
    locale,
    onClick: onCaptionClick ? e => onCaptionClick(month, e) : undefined,
  };
  const caption = React.isValidElement(captionElement) ?
    React.cloneElement(captionElement, captionProps) :
    React.createElement(captionElement, captionProps);

  const weeks = getWeekArray(month, firstDayOfWeek, fixedWeeks);
  return (
    <div style={[defaultStyles.month, classNames.month]} role="grid">
      {caption}
      <Weekdays
        classNames={ classNames }
        weekdaysShort={ weekdaysShort }
        weekdaysLong={ weekdaysLong }
        firstDayOfWeek={ firstDayOfWeek }
        locale={ locale }
        localeUtils={ localeUtils }
        weekdayElement={ weekdayElement }
      />
      <div style={[defaultStyles.body, classNames.body]} role="rowgroup">
        {
          weeks.map((week, j) =>
            <div key={ j } style={[defaultStyles.week, classNames.week]} role="gridcell">
              {week.map(day => children(day, month))}
            </div>,
        )}
      </div>
    </div>
  );
}

export default Radium(Month);

Month.propTypes = {
  classNames: PropTypes.shape({
    month: PropTypes.object,
    body: PropTypes.object,
    week: PropTypes.object,
  }),

  month: PropTypes.instanceOf(Date).isRequired,
  months: React.PropTypes.arrayOf(React.PropTypes.string),

  fixedWeeks: PropTypes.bool,
  captionElement: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.func,
    PropTypes.instanceOf(React.Component),
  ]).isRequired,
  weekdayElement: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.func,
    PropTypes.instanceOf(React.Component),
  ]),

  locale: PropTypes.string.isRequired,
  localeUtils: DayPickerPropTypes.localeUtils.isRequired,
  weekdaysLong: PropTypes.arrayOf(PropTypes.string),
  weekdaysShort: PropTypes.arrayOf(PropTypes.string),
  firstDayOfWeek: PropTypes.number.isRequired,

  onCaptionClick: PropTypes.func,

  children: PropTypes.func.isRequired,
};
