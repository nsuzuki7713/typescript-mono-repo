export const SEARCH_PULL_REQUESTS_QUERY = `
  query SearchPullRequests($searchQuery: String!, $first: Int!, $after: String) {
    search(query: $searchQuery, type: ISSUE, first: $first, after: $after) {
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
            labels(first: 20) {
              nodes {
                name
                color
              }
            }
            milestone {
              title
              dueOn
            }
            assignees(first: 10) {
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
