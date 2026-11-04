const login = '439070443d3e6fe76376';
const key = 'RpAWzXJbpXI0lR';
const fileId = 'mkvBzgBewYtbakJ';

async function test() {
  const infoRes = await fetch(`https://api.streamtape.com/file/info?file=${fileId}&login=${login}&key=${key}`);
  const info = await infoRes.json();
  console.log('Info:', JSON.stringify(info, null, 2));

  const ticketRes = await fetch(`https://api.streamtape.com/file/dlticket?file=${fileId}&login=${login}&key=${key}`);
  const ticket = await ticketRes.json();
  console.log('Ticket:', JSON.stringify(ticket, null, 2));

  if (ticket?.result?.ticket) {
    const waitTime = (ticket.result.wait_time || 5) * 1000;
    console.log(`Waiting ${waitTime}ms...`);
    await new Promise(r => setTimeout(r, waitTime));
    const dlRes = await fetch(`https://api.streamtape.com/file/dl?file=${fileId}&ticket=${ticket.result.ticket}`);
    const dl = await dlRes.json();
    console.log('DL response:', JSON.stringify(dl, null, 2));
  }
}
test().catch(console.error);

