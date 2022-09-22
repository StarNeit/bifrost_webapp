let token = null;

Cypress.Commands.add('login', (): any => {
  const userId = Number(Cypress.env('userId'));
  const username = Cypress.env('username');
  const password = Cypress.env('password');

  // if (token) {
  //   cy.window().its('store').invoke('dispatch', {
  //     type: 'authentication/setSession',
  //     payload: {
  //       userId,
  //       username,
  //       token,
  //     },
  //   });
  //   return;
  // }

  cy.visit('/');
  cy.request(
    'POST',
    'https://8uj3rk4at0.execute-api.us-east-2.amazonaws.com/Prod/api/user/login',
    {
      username,
      password,
    },
  ).then((res) => {
    token = res.headers['xr-token'];
    return new Promise((resolve) => {
      setTimeout(() => {
        cy.window().its('store').invoke('dispatch', {
          type: 'authentication/setSession',
          payload: {
            userId,
            username,
            token,
          },
        });
        resolve(null);
      }, 3000);
    });
  });
});
