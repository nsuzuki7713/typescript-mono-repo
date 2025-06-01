export const GET_USER_REVIEWS_QUERY = `
  query GetUserReviews($login: String!, $first: Int!, $after: String) {
    user(login: $login) {
      pullRequestReviews(first: $first, after: $after) {
        nodes {
          pullRequest {
            number
            repository {
              nameWithOwner
            }
            createdAt
            mergedAt
          }
          state
          submittedAt
          comments {
            totalCount
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
