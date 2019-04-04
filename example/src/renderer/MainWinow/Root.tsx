import React, {CSSProperties} from "react";
import {tsipc} from "../../shared/tsipc";
import {helpers} from "../../shared/helpers";

type TState = {
	ids: string[];
};

export class Root extends React.Component<{}, TState> {
	state: TState = {
		ids: []
	};

	componentDidMount() {
		tsipc.rend.on.mainItemClickAdd(({itemId}) => {
			this.setState({ids: [...this.state.ids, itemId]});
		});

		tsipc.rend.on.mainItemClickRemove(({itemId}) => {
			this.setState({ids: this.state.ids.filter((id) => id != itemId)});
		});
	}

	onClickItemAdd() {
		const itemId = helpers.rand();
		this.setState({ids: [...this.state.ids, itemId]});
		tsipc.rend.send.rendItemClickAdd({itemId: itemId});
	}

	onClickItemRemove(itemId: string) {
		this.setState({ids: this.state.ids.filter((id) => id != itemId)});
		tsipc.rend.send.rendItemClickRemove({itemId: itemId});
	}

	render() {
		return (
			<div>
				items:
				{this.state.ids.map((id) => {
					return <div key={id}>item-{id}</div>;
				})}
			</div>
		);
	}
}

const styles: {[key: string]: CSSProperties} = {
	clickable: {
		color: "blue",
		cursor: "pointer"
	}
};
