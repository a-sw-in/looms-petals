import Loader from './components/Loader';

export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%',
      background: '#fafafa'
    }}>
      <Loader />
    </div>
  );
}
