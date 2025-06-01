/**
 * ユーザーが作成したプルリクエストを取得するGraphQLクエリ
 */
export const GET_USER_PULL_REQUESTS = `
  query GetUserPullRequests($query: String!, $first: Int!, $after: String) {
    search(query: $query, type: ISSUE, first: $first, after: $after) {
      edges {
        node {
          ... on PullRequest {
            number
            title
            body
            url
            repository {
              nameWithOwner
              owner {
                login
              }
              name
            }
            author {
              login
            }
            state
            createdAt
            updatedAt
            mergedAt
            closedAt
            additions
            deletions
            changedFiles
            labels(first: 100) {
              nodes {
                name
                color
              }
            }
            milestone {
              title
              dueOn
            }
            assignees(first: 100) {
              nodes {
                login
              }
            }
            comments {
              totalCount
            }
            reviews {
              totalCount
            }
            reviewThreads {
              totalCount
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

/**
 * ユーザーが行ったレビューを取得するGraphQLクエリ
 */
export const GET_USER_REVIEWS = `
  query GetUserReviews($query: String!, $first: Int!, $after: String) {
    search(query: $query, type: ISSUE, first: $first, after: $after) {
      edges {
        node {
          ... on PullRequest {
            number
            repository {
              nameWithOwner
            }
            reviews(first: 100) {
              nodes {
                author {
                  login
                }
                state
                comments {
                  totalCount
                }
                createdAt
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
