Feature: User authentication

  Scenario: User registers and logs in successfully
    Given a unique user registration payload for auth
    When the user registers via the auth API
    And the user logs in via the auth API
    Then the login response contains a token and user

  Scenario: User login fails with wrong password
    Given a unique user registration payload for auth fail
    When the user registers via the auth API for fail
    And the user attempts to log in with a wrong password
    Then the login fails with status 401 and error
