Feature: End-to-end job application flow

  Scenario: User registers, logs in, and submits a job application with CV
    Given a unique user registration payload
    When the user registers via the API
    And the user logs in via the API
    And the user submits a job application with a CV file
    Then the application is successfully created
