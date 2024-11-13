import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import {updateTime} from '../../reducers/time-count';
import styles from './time-count.css';

const TimeCount = ({
    className,
    style,
    time,
    onUpdateTime
}) => {
    useEffect(() => {
        const timer = setInterval(() => {
            onUpdateTime(time + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [time]);

    const formatTime = seconds => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        // eslint-disable-next-line max-len
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
    time: PropTypes.number,
    onUpdateTime: PropTypes.func
};

const mapStateToProps = state => ({
    time: state.timeCount
});

const mapDispatchToProps = dispatch => ({
    onUpdateTime: time => dispatch(updateTime(time))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TimeCount);
