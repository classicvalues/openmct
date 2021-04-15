/*****************************************************************************
 * Open MCT, Copyright (c) 2014-2021, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT is licensed under the Apache License, Version 2.0 (the
 * 'License'); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/
import PropertiesAction from './PropertiesAction';
import FormProperties from '../components/Form-properties.vue';

export default class CreateAction extends PropertiesAction {
    constructor(openmct, key, parentDomainObject) {
        super(openmct);

        this.key = key;
        this.parentDomainObject = parentDomainObject;
    }

    invoke() {
        const definition = this._getTypeDefination(this.key);

        console.log('CreateAction invoke, Show form', definition.form);

        // if save navigateAndEdit
        // this.openmct.editor.cancel();
    }

    showForm(element) {
        let overlay = this.openmct.overlays.overlay({
            element,   //TODO: create and show new form component
            size: 'small',
            buttons: [
                {
                    label: 'Done',
                    // TODO: save form values into domain object properties
                    callback: () => overlay.dismiss()
                }
            ],
            onDestroy: () => {
            }
        });
    }

    navigateAndEdit(object) {
        let objectPath = object.getCapability('context').getPath(),
            url = '#/browse/' + objectPath
                .slice(1)
                .map(function (o) {
                    return o && openmct.objects.makeKeyString(o.getId());
                })
                .join('/');

        window.location.href = url;

        if (isFirstViewEditable(object.useCapability('adapter'), objectPath)) {
            openmct.editor.edit();
        }
    }
}