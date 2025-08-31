'use client';

import { trpc } from '@/src/app/providers';
import { useState } from 'react';
import type { Project } from '@/src/types/project';

export default function Page() {
  const { data, refetch, isLoading } = trpc.project.list.useQuery();
  const [name, setName] = useState('');
  const mutation = trpc.project.create.useMutation({
    onSuccess: () => {
      setName('');
      refetch();
    },
  });

  return (
    <div style={{ padding: 24 }}>
      <h1>Projects</h1>
      {isLoading ? (
        <p>loading...</p>
      ) : (
        <ul>
          {data?.map((p: Project) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      )}
      <div style={{ marginTop: 16 }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="project name"
        />
        <button
          onClick={() => mutation.mutate({ name })}
          disabled={!name.trim()}
        >
          Create
        </button>
      </div>
    </div>
  );
}
