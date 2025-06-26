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
            reviews(first: 10) {
              totalCount
              nodes {
                state
                submittedAt
                author {
                  login
                }
              }
            }
            reviewThreads {
              totalCount
            }
            timelineItems(last: 50, itemTypes: [READY_FOR_REVIEW_EVENT]) {
              nodes {
                ... on ReadyForReviewEvent {
                  createdAt
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
