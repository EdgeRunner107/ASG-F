import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedName, setSelectedName] = useState('');
  const [names, setNames] = useState([]);

  const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;

    th, td {
      border: 1px solid #ccc;
      padding: 8px;
      text-align: center;
    }

    th {
      background-color: #f5f5f5;
    }
  `;

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/a`)
      .then(response => {
        const result = response.data;
        setData(result);
        setFilteredData(result);

        const cleanedNames = result
          .map(item => (item[4] || '')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .trim()
          )
          .filter(name => name !== '');

        const uniqueNames = Array.from(new Set(cleanedNames));
        setNames(uniqueNames);
      })
      .catch(error => console.error('API 호출 오류:', error));
  }, []);

  const handleNameChange = (e) => {
    const name = e.target.value;
    setSelectedName(name);

    if (name === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item => {
        const donor = (item[4] || '')
          .replace(/[\u200B-\u200D\uFEFF]/g, '')
          .trim();
        return donor === name;
      });
      setFilteredData(filtered);
    }
  };

  const donatorSummary = {};
  const mootList = {};

  filteredData.forEach(item => {
    const donator = item[1];
    const score = Number(item[2]?.replace(/[^0-9]/g, '')) || 0;
    const tag = item[5];

    if (!donator) return;

    if (tag?.includes('묻') && tag !== '묻먹음') {
      // 묻만 포함된 경우 묻 리스트에 저장
      mootList[donator] = (mootList[donator] || 0) + score;
    } else {
      // 일반 선물 또는 묻먹음 포함
      donatorSummary[donator] = (donatorSummary[donator] || 0) + score;
    }
  });

  const totalScore = filteredData.reduce((sum, item) => sum + (Number(item[6]) || 0), 0);

  const parseDateFromString = (dateStr) => {
    if (typeof dateStr !== 'string') return '';
    const match = dateStr.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
    if (!match) return dateStr;
    const [_, year, month, day, hour, min, sec] = match.map(Number);
    const date = new Date(year, month, day, hour, min, sec);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  return (
    <Page>
      <Layout>
        <h1 style={{ textAlign: 'center' }}>ASG Score Board</h1>

        <StyledSelect value={selectedName} onChange={handleNameChange}>
          <option value="">전체</option>
          {names.map((name, index) => (
            <option key={index} value={name}>
              {name}
            </option>
          ))}
        </StyledSelect>

        <h2>Result</h2>

        {/* 선물 리스트 */}
        {selectedName !== '' && Object.entries(donatorSummary).length > 0 && (
          <>
            <h3>선물 리스트</h3>
            <Table>
              <thead>
                <tr>
                  <th>Donator</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(donatorSummary)
                  .sort(([, a], [, b]) => b - a)
                  .map(([donator, total], index) => (
                    <tr key={index}>
                      <td>{donator}</td>
                      <td>{total.toLocaleString()}개</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </>
        )}

        {/* 묻 리스트 */}
        {selectedName !== '' && Object.entries(mootList).length > 0 && (
          <>
            <h3 style={{ marginTop: '20px' }}>묻 리스트</h3>
            <Table>
              <thead>
                <tr>
                  <th>Donator</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(mootList)
                  .sort(([, a], [, b]) => b - a)
                  .map(([donator, total], index) => (
                    <tr key={index} style={{ backgroundColor: '#ffe0eb' }}>
                      <td>{donator}</td>
                      <td>{total.toLocaleString()}개</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </>
        )}

        {selectedName !== '' && (
          <p style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
            <strong>Total :</strong> {totalScore}
          </p>
        )}

        <Table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Donator</th>
              <th>Score</th>
              <th>text</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => {
              const tag = row[5];
              const isMootMeogeum = tag === '묻먹음';
              const isMootOnly = tag?.includes('묻') && tag !== '묻먹음';

              const rowStyle = isMootMeogeum
                ? { backgroundColor: 'lightblue' }
                : isMootOnly
                ? { backgroundColor: '#ffe0eb' }
                : {};

              return (
                <tr key={index} style={rowStyle}>
                  <td>{parseDateFromString(row[0])}</td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                  <td>
                    {row[3]?.length > 10 ? `${row[3].slice(0, 10)}...` : row[3]}
                    {isMootMeogeum && ' (묻먹음)'}
                    {isMootOnly && ' (묻)'}
                  </td>
                  <td>{row[4]}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Layout>
    </Page>
  );
}

export default App;

const Page = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #e9e9e9;
`;

const Layout = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 640px;
  height: 100%;
  max-height: 920px;
  background-color: #ffffff;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
`;

const StyledSelect = styled.select`
  font-size: 1.0rem;
  padding: 8px 12px;
  margin-top: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;
