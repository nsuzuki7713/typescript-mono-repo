export const GET_SINGLE_PULL_REQUEST_QUERY = `
  query GetSinglePullRequest($owner: String!, $name: String!, $number: Int!) {
    repository(owner: $owner, name: $name) {
      pullRequest(number: $number) {
        number
        title
        body
        url
        state
        createdAt
        updatedAt
        mergedAt
        closedAt
        additions
        deletions
        changedFiles
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
        reviews(first: 100) {
          totalCount
          nodes {
            state
            createdAt
            author {
              login
            }
          }
        }
        reviewThreads {
          totalCount
        }
        timelineItems(itemTypes: [READY_FOR_REVIEW_EVENT], first: 1) {
          nodes {
            ... on ReadyForReviewEvent {
              createdAt
            }
          }
        }
      }
    }
  }
`;