package com.alec.cordova.ssh;

import java.io.IOException;
import java.security.PublicKey;
import java.util.Hashtable;

import net.schmizz.sshj.DefaultConfig;
import net.schmizz.sshj.SSHClient;
import net.schmizz.sshj.common.IOUtils;
import net.schmizz.sshj.connection.channel.direct.Session;
import net.schmizz.sshj.connection.channel.direct.Session.Command;
import net.schmizz.sshj.transport.random.JCERandom;
import net.schmizz.sshj.transport.random.SingletonRandomFactory;
import net.schmizz.sshj.transport.verification.HostKeyVerifier;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import android.util.Log;

/**
 * This class echoes a string called from JavaScript.
 */
public class Client extends CordovaPlugin {
	private class AsyncTaskResponse<T> {
		public T result = null;
		public Throwable t = null;
	};

	private DefaultConfig sshConfig = new DefaultConfig() { // http://stackoverflow.com/questions/4879208/android-ssh-example-code
		@Override
		protected void initRandomFactory(boolean ignored) {
			setRandomFactory(new SingletonRandomFactory(new JCERandom.Factory()));
		}
	};

	private HostKeyVerifier hostKeyVerifier = new HostKeyVerifier() { // http://stackoverflow.com/questions/3630101/could-not-load-known-hosts-exception-using-sshj
		public boolean verify(String arg0, int arg1, PublicKey arg2) {
			return true;
		}
	};

	private class ExecCmdReq {
		public ExecCmdReq(SSHClient client, String cmd) {
			this.client = client;
			this.cmd = cmd;
		}

		public SSHClient client;
		public String cmd;
	}

	private Hashtable<String, SSHClient> clients = new Hashtable<String, SSHClient>();

	@Override
	public boolean execute(String action, JSONArray args,
			CallbackContext callbackContext) throws JSONException {
		try {
			if (action.equals("connect")) {
				// CONNECT
				String host = args.getString(0);
				String user = args.getString(1);
				String pass = args.getString(2);
				ConnectReq connReq = new ConnectReq();
				connReq.execute(host, user, pass);
				AsyncTaskResponse<SSHClient> response = connReq.get();
				if (response.t != null)
					throw response.t;
				String clientHash = Integer.toHexString(response.result
						.hashCode());
				this.clients.put(clientHash, response.result);
				callbackContext.success(clientHash);
			} else if (action.equals("disconnect")) {
				// DISCONNECT
				String clientHash = args.getString(0);
				DisonnectReq connReq = new DisonnectReq();
				SSHClient client = this.clients.get(clientHash);
				connReq.execute(client);
				AsyncTaskResponse<Void> response = connReq.get();
				this.clients.remove(clientHash);
				if (response.t != null)
					throw response.t;
				callbackContext.success();

			} else if (action.equals("exec")) {
				// EXEC
				String cmd = args.getString(0);
				String clientHash = args.getString(1);
				ExecuteCmd connReq = new ExecuteCmd();
				SSHClient client = this.clients.get(clientHash);
				ExecCmdReq req = new ExecCmdReq(client, cmd);
				connReq.execute(req);
				AsyncTaskResponse<String> response = connReq.get();
				if (response.t != null)
					throw response.t;
				callbackContext.success(response.result);

			} else
				// ??
				return false;
		} catch (Throwable t) {
			String message = Log.getStackTraceString(t);
			Log.e("Web SSH", message, t);
			callbackContext.error(message);
		}
		return true;
	}


	private class ConnectReq extends
			android.os.AsyncTask<String, Void, AsyncTaskResponse<SSHClient>> {
		@SuppressWarnings("resource")
		@Override
		protected AsyncTaskResponse<SSHClient> doInBackground(String... args) {
			AsyncTaskResponse<SSHClient> result = new AsyncTaskResponse<SSHClient>();
			String host = args[0];
			String user = args[1];
			String pass = args[2];
			final SSHClient ssh = new SSHClient(sshConfig);
			// ssh.loadKnownHosts();
			ssh.addHostKeyVerifier(hostKeyVerifier);
			try {
				ssh.connect(host);
				if (user.length() > 0) {
					String _pass = pass == null ? "" : pass;
					ssh.authPassword(user, _pass);
					result.result = ssh;
				}
			} catch (IOException e) {
				result.t = e;
			}
			return result;
		}
	}

	private class DisonnectReq extends
			android.os.AsyncTask<SSHClient, Void, AsyncTaskResponse<Void>> {
		@Override
		protected AsyncTaskResponse<Void> doInBackground(SSHClient... args) {
			AsyncTaskResponse<Void> result = new AsyncTaskResponse<Void>();
			SSHClient client = args[0];
			// ssh.loadKnownHosts();
			try {
				client.disconnect();
				client.close();
			} catch (IOException e) {
				result.t = e;
			}
			return result;
		}
	}

	private class ExecuteCmd extends
			android.os.AsyncTask<ExecCmdReq, Void, AsyncTaskResponse<String>> {

		@Override
		protected AsyncTaskResponse<String> doInBackground(ExecCmdReq... reqs) {
			AsyncTaskResponse<String> result = new AsyncTaskResponse<String>();
			SSHClient client = reqs[0].client;
			String cmdStr = reqs[0].cmd;
			Session session = null;
			try {
				session = client.startSession();
				Command cmd = session.exec(cmdStr);
				result.result = IOUtils.readFully(cmd.getInputStream())
						.toString();
			} catch (IOException e) {
				result.t = e;
			} finally {
				try {
					if (session != null) {
						session.close();
					}
				} catch (IOException e) {
				}
			}
			return result;
		}
	}

	// private class XXXExecuteCmd extends android.os.AsyncTask<SSHClient, Void,
	// String> {
	//
	// @Override
	// protected String doInBackground(SSHClient... clients) {
	// SSHClient client= clients[0];
	// try{
	// // final SSHClient ssh = new SSHClient();
	// Log.e("Web","1");
	// final SSHClient ssh = new SSHClient(
	// new DefaultConfig() {
	// //http://stackoverflow.com/questions/4879208/android-ssh-example-code
	// @Override
	// protected void initRandomFactory(boolean ignored) {
	// setRandomFactory(new SingletonRandomFactory(new JCERandom.Factory()));
	// }
	// });
	//
	// Log.e("Web","2");
	// //ssh.loadKnownHosts();
	// ssh.addHostKeyVerifier(
	// new HostKeyVerifier() { //
	// http://stackoverflow.com/questions/3630101/could-not-load-known-hosts-exception-using-sshj
	// public boolean verify(String arg0, int arg1, PublicKey arg2) {
	// return true;
	// }
	// });
	//
	// Log.e("Web","3");
	// ssh.connect("192.168.1.20");
	// try {
	// Log.e("Web","4");
	// ssh.authPassword("root","k0me1n1");
	//
	// Log.e("Web","5");
	// final Session session2 = ssh.startSession();
	// try {
	// Log.e("Web","6");
	// final Command cmd = session2.exec("/usr/www/status.cgi");
	// // final Command cmd = session2.exec("echo \"ppp\" > ppp.ppp");
	// Log.e("Web","7");
	//
	// String result = IOUtils.readFully(cmd.getInputStream()).toString();
	// Log.e("Web","8"+result);
	// callbackContext.success(result);
	// //Log.e("Web","\n** exit status: " + cmd.getExitStatus());
	// } finally {
	// session2.close();
	// }
	//
	// }
	// finally {
	// ssh.disconnect();
	// ssh.close();
	// }
	// }catch(Throwable t){
	// Log.e("Web","---" + t);
	// StackTraceElement[] ste = Thread.currentThread().getStackTrace();
	// String err = "Error:";
	// for(StackTraceElement e : ste) {
	// err += e.getFileName()+ "\n"+ e.getLineNumber()+ "\n"+ e.getClassName()+
	// "\n"+ e.getMethodName()+ "\n" + e.toString();
	// }
	// callbackContext.error(err);
	// }
	// return 1;
	// }
	// }

}
