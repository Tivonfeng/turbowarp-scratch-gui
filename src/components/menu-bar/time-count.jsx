import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useState, useEffect, useCallback} from 'react';
import {connect} from 'react-redux';
import {updateTime} from '../../reducers/time-count';
import styles from './time-count.css';

const TimeCount = ({
    className,
    style,
    onUpdateTime
}) => {
    const [time, setTime] = useState(0);

    const updateTimeValue = useCallback(() => {
        setTime(prevTime => {
            const newTime = prevTime + 1;
            setTimeout(() => onUpdateTime(newTime), 0);
            return newTime;
        });
    }, [onUpdateTime]);

    useEffect(() => {
        const timer = setInterval(updateTimeValue, 1000);
        return () => clearInterval(timer);
    }, [updateTimeValue]);

    const formatTime = seconds => {
        if (typeof seconds !== 'number') return '00:00:00';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return `${hours.toString().padStart(2, '0')}:` +
            `${minutes.toString().padStart(2, '0')}:` +
            `${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div
            className={classNames(
                className,
                styles.timeCount
            )}
            style={style}
        >
            {formatTime(time)}
        </div>
    );
};

TimeCount.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    onUpdateTime: PropTypes.func
};

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
    onUpdateTime: time => dispatch(updateTime(time))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TimeCount);
