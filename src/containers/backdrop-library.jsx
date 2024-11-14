import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import VM from 'scratch-vm';

import {getBackdropLibrary} from '../lib/libraries/tw-async-libraries';
import backdropTags from '../lib/libraries/backdrop-tags';
import LibraryComponent from '../components/library/library.jsx';

const messages = defineMessages({
    libraryTitle: {
        defaultMessage: 'Choose a Backdrop',
        description: 'Heading for the backdrop library',
        id: 'gui.costumeLibrary.chooseABackdrop'
    }
});

class BackdropLibrary extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelect',
            'handleLibraryEvent'
        ]);
        
        // 初始化静态存储
        if (!BackdropLibrary.allData) {
            BackdropLibrary.allData = [];
            BackdropLibrary.initialDataLoaded = false;
        }
        window.scratch.pushBackdropsLibrary = data => {
            const event = new CustomEvent('pushBackdropsLibrary', {
                detail: {data}
            });
            document.dispatchEvent(event);
        };
        this.state = {
            data: BackdropLibrary.initialDataLoaded ? BackdropLibrary.allData : getBackdropLibrary()
        };
    }

    componentDidMount () {
        document.addEventListener('pushBackdropsLibrary', this.handleLibraryEvent);

        if (this.state.data.then && !BackdropLibrary.initialDataLoaded) {
            this.state.data.then(data => {
                BackdropLibrary.allData = data;
                
                this.setState({
                    data: BackdropLibrary.allData
                }, () => {
                    if (window.scratchConfig && window.scratchConfig.assets &&
                        window.scratchConfig.assets.handleBeforeBackdropsLibraryOpen) {
                        window.scratchConfig.assets.handleBeforeBackdropsLibraryOpen(BackdropLibrary.initialDataLoaded);
                        BackdropLibrary.initialDataLoaded = true;
                    }
                });
            });
        } else if (window.scratchConfig && window.scratchConfig.assets &&
            window.scratchConfig.assets.handleBeforeBackdropsLibraryOpen) {
            window.scratchConfig.assets.handleBeforeBackdropsLibraryOpen(BackdropLibrary.initialDataLoaded);
        }
    }

    componentWillUnmount () {
        document.removeEventListener('pushBackdropsLibrary', this.handleLibraryEvent);
    }

    handleLibraryEvent = e => {
        const newData = e.detail.data;
        BackdropLibrary.allData = [...BackdropLibrary.allData, ...newData];
        this.setState({
            data: BackdropLibrary.allData
        });
    };

    handleItemSelect (item) {
        const vmBackdrop = {
            name: item.name,
            rotationCenterX: item.rotationCenterX,
            rotationCenterY: item.rotationCenterY,
            bitmapResolution: item.bitmapResolution,
            skinId: null
        };
        this.props.vm.addBackdrop(item.md5ext, vmBackdrop);
    }

    render () {
        return (
            <LibraryComponent
                data={this.state.data.then ? null : this.state.data}
                id="backdropLibrary"
                tags={backdropTags}
                title={this.props.intl.formatMessage(messages.libraryTitle)}
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

BackdropLibrary.propTypes = {
    intl: intlShape.isRequired,
    onRequestClose: PropTypes.func,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default injectIntl(BackdropLibrary);
