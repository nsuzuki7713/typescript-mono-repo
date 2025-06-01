export const GET_USER_REVIEWS_QUERY = `
  query GetUserReviews($reviewQuery: String!, $first: Int!, $after: String) {
    search(query: $reviewQuery, type: ISSUE, first: $first, after: $after) {
      edges {
        node {
          ... on PullRequest {
            number
            title
            repository {
              nameWithOwner
            }
            createdAt
            mergedAt
            reviews(first: 100) {
              nodes {
                author {
                  login
                }
                state
                submittedAt
                comments {
                  totalCount
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
