const login = '439070443d3e6fe76376';
const key = 'RpAWzXJbpXI0lR';
const fileId = 'dPQJxbj031ikdQd'; // Ep 81: 21.65 MB

async function test() {
  const ticketRes = await fetch(`https://api.streamtape.com/file/dlticket?file=${fileId}&login=${login}&key=${key}`);
  const ticket = await ticketRes.json();
  console.log('Ticket response:', JSON.stringify(ticket, null, 2));

  if (ticket?.result?.ticket) {
    const waitTime = (ticket.result.wait_time || 5) * 1000 + 1000;
    console.log(`Waiting ${waitTime}ms...`);
    await new Promise(r => setTimeout(r, waitTime));

    const dlRes = await fetch(`https://api.streamtape.com/file/dl?file=${fileId}&ticket=${ticket.result.ticket}`);
    const dl = await dlRes.json();
    console.log('DL response:', JSON.stringify(dl, null, 2));

    if (dl?.result?.url) {
      console.log('Testing video stream fetch from:', dl.result.url);
      const head = await fetch(dl.result.url, { method: 'HEAD' });
      console.log('Video HEAD status:', head.status, 'Content-Length:', head.headers.get('content-length'), 'Content-Type:', head.headers.get('content-type'));
    }
  }
}

test().catch(console.error);

