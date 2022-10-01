import React, {useContext} from 'react';

type User = {
  id: number,
  name: string
}

// ユーザーデータを保持するContextを作成する
const UserContext = React.createContext<User | null>(null);

const GrandChild = () => {
  // useContextにCOntextを渡すことで、Contextから値を取得する
  const user = useContext(UserContext);

  return user !== null ? <p>Hello, {user.name}</p> : null
}

const Child = () => {
  const now = new Date();

  return (
    <div>
      <p>Current: {now.toLocaleString()}</p>
      <GrandChild />
    </div>
  )
}

export const UseContextSampleParent = () => {
  const user = {
    id: 1,
    name: 'John11'
  }

  return (
    <div>
      <UserContext.Provider value={user}>
        <Child />
      </UserContext.Provider>
    </div>
  )
}