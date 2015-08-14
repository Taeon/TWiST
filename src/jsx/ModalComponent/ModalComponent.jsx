var React   = require('react');
var Reflux   = require('reflux');

var Portal = require( 'react-portal' );

var Component = React.createClass({

	GetDefaultProps:function(){
		onClose:null
	},

	Close:function(){
		this.refs.portal.closePortal();
		if( typeof this.props.onClose == 'function' ){
			this.props.onClose();
		}
	},
	render: function() {
		return (
			 <Portal ref="portal" closeOnEsc={true} closeOnOutsideClick={true} isOpened={this.props.show}>
				<div className="modal" onTouchTap={this.Close}>
					<div onTouchTap={function(e){e.stopPropagation();}}>
						<h2>{this.props.title}</h2>
						<div className="buttons"><button className="material-icons" onClick={this.Close}>clear</button></div>
						{this.props.children}
					</div>
				</div>
			</Portal>
		);
	}
});

module.exports = Component;