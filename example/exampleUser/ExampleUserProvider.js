/*****************************************************************************
 * Open MCT, Copyright (c) 2014-2022, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/

import EventEmitter from 'EventEmitter';
import uuid from 'uuid';
import createExampleUser from './exampleUserCreator';

const STATUSES = [{
    key: "NO_STATUS",
    label: "No Status"
}, {
    key: "NO_GO",
    label: "No Go"
}, {
    key: "GO",
    label: "Go"
}, {
    key: "MAYBE",
    label: "Maybe"
}];

export default class ExampleUserProvider extends EventEmitter {
    constructor(openmct, {defaultStatusRole}) {
        super();

        this.openmct = openmct;
        this.user = undefined;
        this.loggedIn = false;
        this.autoLoginUser = undefined;
        this.status = STATUSES[1];
        this.pollQuestion = undefined;
        this.defaultStatusRole = defaultStatusRole;

        this.ExampleUser = createExampleUser(this.openmct.user.User);
        this.loginPromise = undefined;
    }

    isLoggedIn() {
        return this.loggedIn;
    }

    autoLogin(username) {
        this.autoLoginUser = username;
    }

    getCurrentUser() {
        if (!this.loginPromise) {
            this.loginPromise = this._login().then(() => this.user);
        }

        return this.loginPromise;
    }

    canProvideStatus() {
        return Promise.resolve(true);
    }

    canSetPollQuestion() {
        return Promise.resolve(true);
    }

    hasRole(roleId) {
        if (!this.loggedIn) {
            Promise.resolve(undefined);
        }

        return Promise.resolve(this.user.getRoles().includes(roleId));
    }

    clearAllStatuses() {
        this.setStatus(STATUSES[0]);
    }

    getActiveStatusRole() {
        return Promise.resolve(this.defaultStatusRole);
    }

    getStatus() {
        return Promise.resolve(this.status);
    }

    setStatus(status) {
        this.status = status;
        this.emit('statusChange', status);
    }

    getPollQuestion() {
        return Promise.resolve({
            question: 'Do the thing?',
            timestamp: Date.now()
        });
    }

    setPollQuestion(pollQuestion) {
        this.pollQuestion = {
            question: pollQuestion,
            timestamp: Date.now()
        };
        this.emit("pollQuestionChange", this.pollQuestion);
    }

    getPossibleStatuses() {
        return Promise.resolve(STATUSES);
    }

    _login() {
        const id = uuid();

        // for testing purposes, this will skip the form, this wouldn't be used in
        // a normal authentication process
        if (this.autoLoginUser) {
            this.user = new this.ExampleUser(id, this.autoLoginUser, ['example-role']);
            this.loggedIn = true;

            return Promise.resolve();
        }

        const formStructure = {
            title: "Login",
            sections: [
                {
                    rows: [
                        {
                            key: "username",
                            control: "textfield",
                            name: "Username",
                            pattern: "\\S+",
                            required: true,
                            cssClass: "l-input-lg",
                            value: ''
                        }
                    ]
                }
            ],
            buttons: {
                submit: {
                    label: 'Login'
                }
            }
        };

        return this.openmct.forms.showForm(formStructure).then(
            (info) => {
                this.user = new this.ExampleUser(id, info.username, ['example-role']);
                this.loggedIn = true;
            },
            () => { // user canceled, setting a default username
                this.user = new this.ExampleUser(id, 'Pat', ['example-role']);
                this.loggedIn = true;
            }
        );
    }
}
