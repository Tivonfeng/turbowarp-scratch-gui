import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';
import VM from 'scratch-vm';

import {getSpriteLibrary} from '../lib/libraries/tw-async-libraries';
import randomizeSpritePosition from '../lib/randomize-sprite-position';
import spriteTags from '../lib/libraries/sprite-tags';

import LibraryComponent from '../components/library/library.jsx';

const messages = defineMessages({
    libraryTitle: {
        defaultMessage: 'Choose a Sprite',
        description: 'Heading for the sprite library',
        id: 'gui.spriteLibrary.chooseASprite'
    }
});

class SpriteLibrary extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelect',
            'handleLibraryEvent'
        ]);
        
        // 初始化静态存储
        if (!SpriteLibrary.allData) {
            SpriteLibrary.allData = [];
            SpriteLibrary.initialDataLoaded = false;
        }
        window.scratch.pushSpriteLibrary = data => {
            const event = new CustomEvent('pushSpriteLibrary', {
                detail: {data}
            });
            document.dispatchEvent(event);
        };
        this.state = {
            data: SpriteLibrary.initialDataLoaded ? SpriteLibrary.allData : getSpriteLibrary()
        };
    }


    componentDidMount () {
        // 添加事件监听
        document.addEventListener('pushSpriteLibrary', this.handleLibraryEvent);

        // 处理初始数据加载
        if (this.state.data.then && !SpriteLibrary.initialDataLoaded) {
            this.state.data.then(data => {
                SpriteLibrary.allData = data;
                this.setState({
                    data: SpriteLibrary.allData
                }, () => {
                    // 初始数据加载完成后触发配置的回调
                    if (window.scratchConfig && window.scratchConfig.assets &&
                        window.scratchConfig.assets.handleBeforeSpriteLibraryOpen) {
                        window.scratchConfig.assets.handleBeforeSpriteLibraryOpen(SpriteLibrary.initialDataLoaded);
                        SpriteLibrary.initialDataLoaded = true;
                    }
                });
            });
        } else if (window.scratchConfig && window.scratchConfig.assets &&
            window.scratchConfig.assets.handleBeforeSpriteLibraryOpen) {
            window.scratchConfig.assets.handleBeforeSpriteLibraryOpen(SpriteLibrary.initialDataLoaded);
        }
    }

    componentWillUnmount () {
        // 清理事件监听
        document.removeEventListener('pushSpriteLibrary', this.handleLibraryEvent);
    }

    handleLibraryEvent = e => {
        const newData = e.detail.data;
        // 合并新数据到静态存储
        SpriteLibrary.allData = [...SpriteLibrary.allData, ...newData];
        this.setState({
            data: SpriteLibrary.allData
        });
    };
    handleItemSelect (item) {
        randomizeSpritePosition(item);
        this.props.vm.addSprite(JSON.stringify(item)).then(() => {
            this.props.onActivateBlocksTab();
        });
    }

    render () {
        return (
            <LibraryComponent
                data={this.state.data.then ? null : this.state.data}
                id="spriteLibrary"
                tags={spriteTags}
                title={this.props.intl.formatMessage(messages.libraryTitle)}
                removedTrademarks
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

SpriteLibrary.propTypes = {
    intl: intlShape.isRequired,
    onActivateBlocksTab: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default injectIntl(SpriteLibrary);
