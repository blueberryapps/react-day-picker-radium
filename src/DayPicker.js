import Radium from 'radium';
import React, { Component, PropTypes } from 'react';
import Caption from './Caption';
import Navbar from './Navbar';
import Month from './Month';
import Day from './Day';
import Weekday from './Weekday';

import * as Helpers from './Helpers';
import * as DateUtils from './DateUtils';
import * as LocaleUtils from './LocaleUtils';
import defaultStyles from './defaultStyles';

import keys from './keys';
import DayPickerPropTypes, { ModifierPropType } from './PropTypes';

class DayPicker extends Component {
  static VERSION = '5.2.0';

  static propTypes = {

    // Rendering months
    initialMonth: PropTypes.instanceOf(Date),
    month: PropTypes.instanceOf(Date),
    numberOfMonths: PropTypes.number,
    fromMonth: PropTypes.instanceOf(Date),
    toMonth: PropTypes.instanceOf(Date),
    canChangeMonth: PropTypes.bool,
    reverseMonths: PropTypes.bool,
    pagedNavigation: PropTypes.bool,

    // Modifiers
    selectedDays: PropTypes.oneOfType([
      ModifierPropType,
      PropTypes.arrayOf(ModifierPropType),
    ]),
    disabledDays: PropTypes.oneOfType([
      ModifierPropType,
      PropTypes.arrayOf(ModifierPropType),
    ]),
    modifiers: PropTypes.object,

    // Localization
    dir: PropTypes.string,
    firstDayOfWeek: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6]),
    labels: PropTypes.shape({
      nextMonth: PropTypes.string.isRequired,
      previousMonth: PropTypes.string.isRequired,
    }).isRequired,
    locale: PropTypes.string,
    localeUtils: DayPickerPropTypes.localeUtils,
    months: PropTypes.arrayOf(PropTypes.string),
    weekdaysLong: PropTypes.arrayOf(PropTypes.string),
    weekdaysShort: PropTypes.arrayOf(PropTypes.string),

    // Customization
    enableOutsideDays: PropTypes.bool,
    fixedWeeks: PropTypes.bool,

    // Styles and HTML
    styles: PropTypes.shape({
      body: PropTypes.object,
      container: PropTypes.object,
      day: PropTypes.object,
      disabled: PropTypes.object,
      interactionDisabled: PropTypes.object,
      month: PropTypes.object,
      navBar: PropTypes.object,
      outside: PropTypes.object,
      selected: PropTypes.object,
      today: PropTypes.object,
      week: PropTypes.object,
    }),
    containerProps: PropTypes.object,
    tabIndex: PropTypes.number,

    // Custom elements
    renderDay: PropTypes.func,
    weekdayElement: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.func,
      PropTypes.instanceOf(Component),
    ]),
    navbarElement: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.func,
      PropTypes.instanceOf(Component),
    ]),
    captionElement: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.func,
      PropTypes.instanceOf(Component),
    ]),

    // Events
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    onKeyDown: PropTypes.func,
    onDayClick: PropTypes.func,
    onDayKeyDown: PropTypes.func,
    onDayMouseEnter: PropTypes.func,
    onDayMouseLeave: PropTypes.func,
    onDayTouchStart: PropTypes.func,
    onDayTouchEnd: PropTypes.func,
    onDayFocus: PropTypes.func,
    onMonthChange: PropTypes.func,
    onCaptionClick: PropTypes.func,

  };

  static defaultProps = {
    styles: {},
    tabIndex: 0,
    initialMonth: new Date(),
    numberOfMonths: 1,
    labels: {
      previousMonth: 'Previous Month',
      nextMonth: 'Next Month',
    },
    locale: 'en',
    localeUtils: LocaleUtils,
    enableOutsideDays: false,
    fixedWeeks: false,
    canChangeMonth: true,
    reverseMonths: false,
    pagedNavigation: false,
    renderDay: day => day.getDate(),
    weekdayElement: <Weekday />,
    navbarElement: <Navbar />,
    captionElement: <Caption />,
  };

  constructor(props) {
    super(props);
    /* istanbul ignore next */
    // for the ignore above see: https://github.com/gotwarlost/istanbul/issues/690

    this.renderDayInMonth = this.renderDayInMonth.bind(this);
    this.showNextMonth = this.showNextMonth.bind(this);
    this.showPreviousMonth = this.showPreviousMonth.bind(this);

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleDayClick = this.handleDayClick.bind(this);
    this.handleDayKeyDown = this.handleDayKeyDown.bind(this);

    this.state = this.getStateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.month !== nextProps.month) {
      this.setState(this.getStateFromProps(nextProps));
    }
  }

  getStateFromProps = (props) => {
    const initialMonth = Helpers.startOfMonth(props.month || props.initialMonth);
    let currentMonth = initialMonth;

    if (props.pagedNavigation && props.numberOfMonths > 1 && props.fromMonth) {
      const diffInMonths = Helpers.getMonthsDiff(props.fromMonth, currentMonth);
      currentMonth = DateUtils.addMonths(
        props.fromMonth,
        Math.floor(diffInMonths / props.numberOfMonths) * props.numberOfMonths,
      );
    }
    return { currentMonth };
  }

  getDayNodes() {
    const selector = '.DayPicker--day:not(.DayPicker--day__outside)';
    return this.dayPicker.querySelectorAll(selector);
  }

  getNextNavigableMonth() {
    return DateUtils.addMonths(this.state.currentMonth, this.props.numberOfMonths);
  }

  getPreviousNavigableMonth() {
    return DateUtils.addMonths(this.state.currentMonth, -1);
  }

  dayPicker = null

  allowPreviousMonth() {
    const previousMonth = DateUtils.addMonths(this.state.currentMonth, -1);
    return this.allowMonth(previousMonth);
  }

  allowNextMonth() {
    const nextMonth = DateUtils.addMonths(this.state.currentMonth, this.props.numberOfMonths);
    return this.allowMonth(nextMonth);
  }

  allowMonth(d) {
    const { fromMonth, toMonth, canChangeMonth } = this.props;
    if (!canChangeMonth ||
      (fromMonth && Helpers.getMonthsDiff(fromMonth, d) < 0) ||
      (toMonth && Helpers.getMonthsDiff(toMonth, d) > 0)) {
      return false;
    }
    return true;
  }

  allowYearChange() {
    return this.props.canChangeMonth;
  }

  showMonth(d, callback) {
    if (!this.allowMonth(d)) {
      return;
    }
    this.setState({ currentMonth: Helpers.startOfMonth(d) }, () => {
      if (callback) {
        callback();
      }
      if (this.props.onMonthChange) {
        this.props.onMonthChange(this.state.currentMonth);
      }
    });
  }

  showNextMonth(callback) {
    if (!this.allowNextMonth()) {
      return;
    }
    const deltaMonths = this.props.pagedNavigation ? this.props.numberOfMonths : 1;
    const nextMonth = DateUtils.addMonths(this.state.currentMonth, deltaMonths);
    this.showMonth(nextMonth, callback);
  }

  showPreviousMonth(callback) {
    if (!this.allowPreviousMonth()) {
      return;
    }
    const deltaMonths = this.props.pagedNavigation ? this.props.numberOfMonths : 1;
    const previousMonth = DateUtils.addMonths(this.state.currentMonth, -deltaMonths);
    this.showMonth(previousMonth, callback);
  }

  showNextYear() {
    if (!this.allowYearChange()) {
      return;
    }
    const nextMonth = DateUtils.addMonths(this.state.currentMonth, 12);
    this.showMonth(nextMonth);
  }

  showPreviousYear() {
    if (!this.allowYearChange()) {
      return;
    }
    const nextMonth = DateUtils.addMonths(this.state.currentMonth, -12);
    this.showMonth(nextMonth);
  }

  focusFirstDayOfMonth() {
    this.getDayNodes()[0].focus();
  }

  focusLastDayOfMonth() {
    const dayNodes = this.getDayNodes();
    dayNodes[dayNodes.length - 1].focus();
  }

  focusPreviousDay(dayNode) {
    const dayNodes = this.getDayNodes();
    const dayNodeIndex = [...dayNodes].indexOf(dayNode);

    if (dayNodeIndex === 0) {
      this.showPreviousMonth(() => this.focusLastDayOfMonth());
    } else {
      dayNodes[dayNodeIndex - 1].focus();
    }
  }

  focusNextDay(dayNode) {
    const dayNodes = this.getDayNodes();
    const dayNodeIndex = [...dayNodes].indexOf(dayNode);

    if (dayNodeIndex === dayNodes.length - 1) {
      this.showNextMonth(() => this.focusFirstDayOfMonth());
    } else {
      dayNodes[dayNodeIndex + 1].focus();
    }
  }

  focusNextWeek(dayNode) {
    const dayNodes = this.getDayNodes();
    const dayNodeIndex = [...dayNodes].indexOf(dayNode);
    const isInLastWeekOfMonth = dayNodeIndex > dayNodes.length - 8;

    if (isInLastWeekOfMonth) {
      this.showNextMonth(() => {
        const daysAfterIndex = dayNodes.length - dayNodeIndex;
        const nextMonthDayNodeIndex = 7 - daysAfterIndex;
        this.getDayNodes()[nextMonthDayNodeIndex].focus();
      });
    } else {
      dayNodes[dayNodeIndex + 7].focus();
    }
  }

  focusPreviousWeek(dayNode) {
    const dayNodes = this.getDayNodes();
    const dayNodeIndex = [...dayNodes].indexOf(dayNode);
    const isInFirstWeekOfMonth = dayNodeIndex <= 6;

    if (isInFirstWeekOfMonth) {
      this.showPreviousMonth(() => {
        const previousMonthDayNodes = this.getDayNodes();
        const startOfLastWeekOfMonth = previousMonthDayNodes.length - 7;
        const previousMonthDayNodeIndex = startOfLastWeekOfMonth + dayNodeIndex;
        previousMonthDayNodes[previousMonthDayNodeIndex].focus();
      });
    } else {
      dayNodes[dayNodeIndex - 7].focus();
    }
  }

  // Event handlers

  handleKeyDown(e) {
    e.persist();

    switch (e.keyCode) {
      case keys.LEFT:
        this.showPreviousMonth();
        break;
      case keys.RIGHT:
        this.showNextMonth();
        break;
      case keys.UP:
        this.showPreviousYear();
        break;
      case keys.DOWN:
        this.showNextYear();
        break;
      default:
        break;
    }

    if (this.props.onKeyDown) {
      this.props.onKeyDown(e);
    }
  }

  handleDayKeyDown(day, modifiers, e) {
    e.persist();
    switch (e.keyCode) {
      case keys.LEFT:
        Helpers.cancelEvent(e);
        this.focusPreviousDay(e.target);
        break;
      case keys.RIGHT:
        Helpers.cancelEvent(e);
        this.focusNextDay(e.target);
        break;
      case keys.UP:
        Helpers.cancelEvent(e);
        this.focusPreviousWeek(e.target);
        break;
      case keys.DOWN:
        Helpers.cancelEvent(e);
        this.focusNextWeek(e.target);
        break;
      case keys.ENTER:
      case keys.SPACE:
        Helpers.cancelEvent(e);
        if (this.props.onDayClick) {
          this.handleDayClick(day, modifiers, e);
        }
        break;
      default:
        break;
    }
    if (this.props.onDayKeyDown) {
      this.props.onDayKeyDown(day, modifiers, e);
    }
  }

  handleDayClick(day, modifiers, e) {
    e.persist();
    if (modifiers.outside) {
      this.handleOutsideDayClick(day);
    }
    this.props.onDayClick(day, modifiers, e);
  }

  handleOutsideDayClick(day) {
    const { currentMonth } = this.state;
    const { numberOfMonths } = this.props;
    const diffInMonths = Helpers.getMonthsDiff(currentMonth, day);
    if (diffInMonths > 0 && diffInMonths >= numberOfMonths) {
      this.showNextMonth();
    } else if (diffInMonths < 0) {
      this.showPreviousMonth();
    }
  }
  renderNavbar() {
    const {
      labels,
      locale,
      localeUtils,
      canChangeMonth,
      navbarElement,
    ...attributes } = this.props;

    if (!canChangeMonth) return null;

    const props = {
      styles: this.props.styles,
      style: defaultStyles.navBar,
      nextMonth: this.getNextNavigableMonth(),
      previousMonth: this.getPreviousNavigableMonth(),
      showPreviousButton: this.allowPreviousMonth(),
      showNextButton: this.allowNextMonth(),
      onNextClick: this.showNextMonth,
      onPreviousClick: this.showPreviousMonth,
      dir: attributes.dir,
      labels,
      locale,
      localeUtils,
    };
    return React.isValidElement(navbarElement) ?
        React.cloneElement(navbarElement, props) :
        React.createElement(navbarElement, props);
  }
  renderDayInMonth(day, month) {
    const propModifiers = Helpers.getModifiersFromProps(this.props);
    const dayModifiers = Helpers.getModifiersForDay(day, propModifiers);
    if (DateUtils.isSameDay(day, new Date()) &&
        !Object.prototype.hasOwnProperty.call(propModifiers, 'today')) {
      dayModifiers.push('today');
    }
    if (day.getMonth() !== month.getMonth()) {
      dayModifiers.push('outside');
    }

    const isOutside = day.getMonth() !== month.getMonth();
    let tabIndex = null;
    if (this.props.onDayClick && !isOutside) {
      tabIndex = -1;
      // Focus on the first day of the month
      if (day.getDate() === 1) {
        tabIndex = this.props.tabIndex;
      }
    }
    const key = `${day.getFullYear()}${day.getMonth()}${day.getDate()}`;
    const modifiers = dayModifiers.map((modifier) => modifier);

    return (
      <Day
        key={ `${isOutside ? 'outside-' : ''}${key}` }
        styles={ this.props.styles }
        day={ day }
        modifiers={ modifiers }
        empty={ isOutside && !this.props.enableOutsideDays && !this.props.fixedWeeks }
        interactionDisabled={ !this.props.onDayClick }

        tabIndex={ tabIndex }

        ariaLabel={ this.props.localeUtils.formatDay(day, this.props.locale) }
        ariaDisabled={ isOutside || dayModifiers.indexOf('disabled') > -1 }
        ariaSelected={ dayModifiers.indexOf('selected') > -1 }

        onMouseEnter={ this.props.onDayMouseEnter }
        onMouseLeave={ this.props.onDayMouseLeave }
        onKeyDown={ this.handleDayKeyDown }
        onTouchStart={ this.props.onDayTouchStart }
        onTouchEnd={ this.props.onDayTouchEnd }
        onFocus={ this.props.onDayFocus }
        onClick={ this.props.onDayClick ? this.handleDayClick : undefined }
      >
        {this.props.renderDay(day, modifiers)}
      </Day>
    );
  }

  renderMonths() {
    const months = [];
    const firstDayOfWeek = Helpers.getFirstDayOfWeekFromProps(this.props);

    for (let i = 0; i < this.props.numberOfMonths; i += 1) {
      const month = DateUtils.addMonths(this.state.currentMonth, i);

      months.push(
        <Month
          key={ i }
          styles={ this.props.styles }

          month={ month }
          months={ this.props.months }

          weekdayElement={ this.props.weekdayElement }
          captionElement={ this.props.captionElement }
          fixedWeeks={ this.props.fixedWeeks }

          weekdaysShort={ this.props.weekdaysShort }
          weekdaysLong={ this.props.weekdaysLong }
          locale={ this.props.locale }
          localeUtils={ this.props.localeUtils }
          firstDayOfWeek={ firstDayOfWeek }

          onCaptionClick={ this.props.onCaptionClick }
        >
          {this.renderDayInMonth}
        </Month>);
    }

    if (this.props.reverseMonths) {
      months.reverse();
    }
    return months;
  }

  render() {

    return (
      <div
        { ...this.props.containerProps }
        style={[defaultStyles.container, this.props.styles.container]}
        ref={ (el) => { this.dayPicker = el; } }
        role="application"
        lang={ this.props.locale }
        tabIndex={ this.props.canChangeMonth && this.props.tabIndex }
        onKeyDown={ this.handleKeyDown }
        onFocus={ this.props.onFocus }
        onBlur={ this.props.onBlur }
      >
        {this.renderNavbar()}
        {this.renderMonths()}
      </div>
    );
  }
}

export default Radium(DayPicker);
