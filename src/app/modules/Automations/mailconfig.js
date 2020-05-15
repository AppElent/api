import moment from 'moment';

const config = {
    folder: 'inbox',
    lookup: {
        // alle van adressen met een nicename erbij
        'from.emailAddress.address': {
            'info@aliexpress.com': 'AliExpress',
            'info@microsoft.com': 'Microsoft',
            'hello@1password.com': '1Password',
            'abnamro@nl.abnamro.nl': 'ABN Amro',
            'info@mail.aegon.nl': 'AEGON',
            'nieuwsbrief@nieuwsbrief.ah.nl': 'Albert Heijn',
            'transaction@notice.aliexpress.com': 'AliExpress',
            'noreply@anaccarwash.com': 'ANAC Carwash',
            'annavanommen18@hotmail.nl': 'Anna van Ommen',
        },
    },
    rules: [
        {
            name: 'Staatsloterij mails',
            conditions: [
                {
                    field: 'subject',
                    operator: '=',
                    value: 'Alsjeblieft, je lotnummer(s) voor 10 mei',
                },
                {
                    field: 'isRead',
                    operator: '=',
                    value: true,
                },
                {
                    field: 'createdDateTime',
                    operator: '<',
                    value: moment()
                        .add(-3, 'days')
                        .toDate(),
                },
            ],
        },
        {
            name: 'Beveiligingsmails',
            conditions: [
                {
                    field: 'from.emailAddress.address',
                    operator: 'in',
                    value: 'account-security-noreply@accountprotection.microsoft.com,no-reply@accounts.google.com',
                },
                {
                    field: 'isRead',
                    operator: '=',
                    value: true,
                },
                {
                    field: 'createdDateTime',
                    operator: '<',
                    value: moment()
                        .add(-3, 'days')
                        .toDate(),
                },
            ],
        },
        {
            name: 'Move mails from Anna (incl familie)',
            conditions: [
                {
                    field: 'from.emailAddress.address',
                    operator: 'in',
                    value: 'annavanommen18@hotmail.nl,hannekeommen@gmail.com',
                },
                {
                    field: 'isRead',
                    operator: '=',
                    value: true,
                },
            ],
            actions: [
                {
                    type: 'move',
                    value:
                        'AQMkADAwATMwMAItODllMi1lNDIzLTAwAi0wMAoALgAAAyOb2iBi0LlNgOzBKpWYmAAbAQD2Nylp4nzxQLv-DZBWXutuAAAA9i_uVgAAAA==',
                },
            ],
        },
        {
            name: 'Move mails from Paypal',
            conditions: [
                {
                    field: 'from.emailAddress.address',
                    operator: '=',
                    value: 'paypal@mail.paypal.nl',
                },
                {
                    field: 'subject',
                    operator: '=',
                    value: 'Het laatste nieuws en je transacties',
                },
            ],
        },
    ],
};

export default config;
