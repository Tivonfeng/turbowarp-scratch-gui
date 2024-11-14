import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import VM from 'scratch-vm';

import {getCostumeLibrary} from '../lib/libraries/tw-async-libraries';
import spriteTags from '../lib/libraries/sprite-tags';
import LibraryComponent from '../components/library/library.jsx';

const messages = defineMessages({
    libraryTitle: {
        defaultMessage: 'Choose a Costume',
        description: 'Heading for the costume library',
        id: 'gui.costumeLibrary.chooseACostume'
    }
});

class CostumeLibrary extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelect',
            'handleLibraryEvent'
        ]);
        
        // 初始化静态存储
        if (!CostumeLibrary.allData) {
            CostumeLibrary.allData = [];
            CostumeLibrary.initialDataLoaded = false;
        }
        window.scratch.pushCostumesLibrary = data => {
            const event = new CustomEvent('pushCostumesLibrary', {
                detail: {data}
            });
            document.dispatchEvent(event);
        };
        this.state = {
            data: CostumeLibrary.initialDataLoaded ? CostumeLibrary.allData : getCostumeLibrary()
        };
    }

    componentDidMount () {
        document.addEventListener('pushCostumesLibrary', this.handleLibraryEvent);

        if (this.state.data.then && !CostumeLibrary.initialDataLoaded) {
            this.state.data.then(data => {
                CostumeLibrary.allData = data;
                
                this.setState({
                    data: CostumeLibrary.allData
                }, () => {
                    if (window.scratchConfig && window.scratchConfig.assets &&
                        window.scratchConfig.assets.handleBeforeCostumesLibraryOpen) {
                        window.scratchConfig.assets.handleBeforeCostumesLibraryOpen(CostumeLibrary.initialDataLoaded);
                        CostumeLibrary.initialDataLoaded = true;
                    }
                });
            });
        } else if (window.scratchConfig && window.scratchConfig.assets &&
            window.scratchConfig.assets.handleBeforeCostumesLibraryOpen) {
            window.scratchConfig.assets.handleBeforeCostumesLibraryOpen(CostumeLibrary.initialDataLoaded);
        }
    }

    componentWillUnmount () {
        document.removeEventListener('pushCostumesLibrary', this.handleLibraryEvent);
    }

    handleLibraryEvent = e => {
        const newData = e.detail.data;
        CostumeLibrary.allData = [...CostumeLibrary.allData, ...newData];
        this.setState({
            data: CostumeLibrary.allData
        });
    };

    handleItemSelect (item) {
        const vmCostume = {
            name: item.name,
            rotationCenterX: item.rotationCenterX,
            rotationCenterY: item.rotationCenterY,
            bitmapResolution: item.bitmapResolution,
            skinId: null
        };
        this.props.vm.addCostumeFromLibrary(item.md5ext, vmCostume);
    }

    render () {
        return (
            <LibraryComponent
                data={this.state.data.then ? null : this.state.data}
                id="costumeLibrary"
                tags={spriteTags}
                title={this.props.intl.formatMessage(messages.libraryTitle)}
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
                removedTrademarks
            />
        );
    }
}

CostumeLibrary.propTypes = {
    intl: intlShape.isRequired,
    onRequestClose: PropTypes.func,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default injectIntl(CostumeLibrary);
